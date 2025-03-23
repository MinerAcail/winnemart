package model

import (
	"github.com/google/uuid"
	"github.com/lib/pq"
	"time"
)

type Vendor struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	Name      string     `json:"name"`
	Type      string     `json:"type"`
	Number    string     `json:"number"`
	Password  *string    `json:"password,omitempty"`
	Dpfile    *string    `json:"dpfile,omitempty"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

type VendorOrder struct {
	ID                    uuid.UUID      `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	CartItemIDs           pq.StringArray `gorm:"type:text[]" json:"CartItemIDs,omitempty"`
	EstimatedDeliveryDate string         `json:"estimatedDeliveryDate"`
	CreatedAt             time.Time      `json:"createdAt"`
	UpdatedAt             time.Time      `json:"updatedAt"`
}

type UnavailablePeriod struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`
	VendorID  string     `json:"VendorId"`
	Day       string     `json:"day"`
	StartTime string     `json:"startTime"`
	EndTime   string     `json:"endTime"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

func (Vendor) IsReturns()     {}
func (JobRequest) IsReturns() {}
