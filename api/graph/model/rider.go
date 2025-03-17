package model

import (
	"time"

	"github.com/google/uuid"
)

type AssignRider struct {
	ID uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4();primary_key" json:"id"`

	RiderID *string `json:"riderID,omitempty"`
	OrderID *string `json:"orderID,omitempty"`

	EstimatedDeliveryDate string    `json:"estimatedDeliveryDate"`
	CreatedAt             time.Time `json:"createdAt"`
	UpdatedAt             time.Time `json:"updatedAt"`
}
