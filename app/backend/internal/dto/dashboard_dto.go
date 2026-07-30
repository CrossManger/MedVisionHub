package dto

type DashboardStatsResponse struct {
	TotalPatients   int64             `json:"total_patients"`
	TotalScans      int64             `json:"total_scans"`
	CompletedScans  int64             `json:"completed_scans"`
	PendingScans    int64             `json:"pending_scans"`
	InProgressScans int64             `json:"in_progress_scans"`
	CompletionRate  float64           `json:"completion_rate"`
	ScansByType     ScansByType       `json:"scans_by_type"`
	RecentPatients  []PatientResponse `json:"recent_patients"`
}

type ScansByType struct {
	Xray       int64 `json:"xray"`
	Mri        int64 `json:"mri"`
	CtScan     int64 `json:"ct_scan"`
	Ultrasound int64 `json:"ultrasound"`
}
