package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

// NotificationEvent represents the structure of a real-time notification sent to clients
type NotificationEvent struct {
	ID            uint   `json:"id"`
	UserID        uint   `json:"user_id"`
	Title         string `json:"title"`
	Message       string `json:"message"`
	Type          string `json:"type"`
	IsRead        bool   `json:"is_read"`
	RelatedEntity string `json:"related_entity,omitempty"`
	RelatedID     uint   `json:"related_id,omitempty"`
	CreatedAt     string `json:"created_at"`
}

// Hub maintains the set of active clients and broadcasts messages to specific users
type Hub struct {
	// Registered clients mapped by UserID to allow multiple connections per user (e.g. multiple browser tabs)
	clients map[uint]map[*Client]bool

	// Inbound messages destined for a specific user
	sendToUser chan *NotificationEvent

	// Register requests from the clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[uint]map[*Client]bool),
		sendToUser: make(chan *NotificationEvent),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if _, exists := h.clients[client.UserID]; !exists {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("[WebSocket Hub] Client registered for UserID: %d (Total tabs for user: %d)", client.UserID, len(h.clients[client.UserID]))

		case client := <-h.Unregister:
			h.mu.Lock()
			if userClients, exists := h.clients[client.UserID]; exists {
				if _, ok := userClients[client]; ok {
					delete(userClients, client)
					close(client.Send)
					if len(userClients) == 0 {
						delete(h.clients, client.UserID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WebSocket Hub] Client unregistered for UserID: %d", client.UserID)

		case event := <-h.sendToUser:
			h.mu.RLock()
			userClients, exists := h.clients[event.UserID]
			if exists {
				data, err := json.Marshal(event)
				if err == nil {
					for client := range userClients {
						select {
						case client.Send <- data:
						default:
							close(client.Send)
							delete(userClients, client)
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// SendToUser pushes a notification event to all connected clients of a specific user
func (h *Hub) SendToUser(event *NotificationEvent) {
	if event == nil {
		return
	}
	h.sendToUser <- event
}
