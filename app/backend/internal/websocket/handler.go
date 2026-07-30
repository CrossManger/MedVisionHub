package websocket

import (
	"log"
	"net/http"

	"medvision-hub/pkg/utils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// Allow CORS for WebSockets
		return true
	},
}

// ServeWS handles websocket requests from the peer.
func ServeWS(hub *Hub, c *gin.Context) {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Thiếu token xác thực"})
		return
	}

	token, err := utils.ValidateToken(tokenStr)
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token xác thực không hợp lệ hoặc đã hết hạn"})
		return
	}

	claims, err := utils.ExtractClaims(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Không thể trích xuất thông tin người dùng từ token"})
		return
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID người dùng không hợp lệ trong token"})
		return
	}
	userID := uint(userIDFloat)

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection to WebSocket: %v", err)
		return
	}

	client := &Client{
		Hub:    hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: userID,
	}
	client.Hub.Register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.WritePump()
	go client.ReadPump()
}
