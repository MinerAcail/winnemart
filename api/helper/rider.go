package helper

import (
	"fmt"
	"log"

	"github.com/mineracail/sergi/graph/model"
	"gorm.io/gorm"
)

func AssignDriverToOrder(tx *gorm.DB, order *model.Order, orderIDStr string) error {
	// Find all available drivers
	var drivers []model.JobRequest
	if err := tx.Where("type = ? AND state = ?", "Driver", "APPROVED").Find(&drivers).Error; err != nil {
		log.Println("Error finding available drivers:", err)
		return nil // This is not an error condition, just log and continue
	}

	// If no drivers are available
	if len(drivers) == 0 {
		log.Println("No available drivers found, order will be assigned later")
		return nil
	}

	// Debug: Print all available drivers
	log.Println("Available drivers:", len(drivers))
	for i, driver := range drivers {
		log.Printf("Driver %d: ID=%s, Name=%s", i, driver.ID.String(), driver.Name)
	}

	// Create a map to store the number of active deliveries for each driver
	driverWorkloads := make(map[string]int)

	// Initialize workload counts for all drivers
	for _, driver := range drivers {
		driverWorkloads[driver.ID.String()] = 0
	}

	// Get current active assignments for all drivers
	var assignments []model.AssignRider
	if err := tx.Where("order_id IS NOT NULL").Find(&assignments).Error; err != nil {
		log.Println("Error fetching current assignments:", err)
		// Continue with the process even if we can't get current assignments
	} else {
		// Debug: Print all assignments
		log.Println("Total assignments found:", len(assignments))
		
		// Count active deliveries for each driver
		for _, assignment := range assignments {
			if assignment.RiderID != nil {
				// Check if the order is still active (not DELIVERED or CANCELLED)
				var associatedOrder model.Order
				if err := tx.Where("id = ?", *assignment.OrderID).First(&associatedOrder).Error; err == nil {
					if associatedOrder.Status != "DELIVERED" && associatedOrder.Status != "CANCELLED" {
						driverWorkloads[*assignment.RiderID]++
						log.Printf("Active order found for driver %s: OrderID=%s, Status=%s", 
							*assignment.RiderID, *assignment.OrderID, associatedOrder.Status)
					}
				}
			}
		}
	}

	// Debug: Print all workloads
	log.Println("Driver workloads:")
	for driverID, workload := range driverWorkloads {
		log.Printf("Driver ID: %s, Workload: %d", driverID, workload)
	}

	// Find the driver with the least number of active deliveries
	var selectedDriverID string
	minWorkload := -1

	// Convert map to slice for deterministic ordering
	type driverLoad struct {
		ID       string
		Workload int
	}
	var workloadSlice []driverLoad
	for driverID, workload := range driverWorkloads {
		workloadSlice = append(workloadSlice, driverLoad{ID: driverID, Workload: workload})
	}

	// Sort by workload (ascending)
	for i := 0; i < len(workloadSlice); i++ {
		if minWorkload == -1 || workloadSlice[i].Workload < minWorkload {
			minWorkload = workloadSlice[i].Workload
			selectedDriverID = workloadSlice[i].ID
		}
	}

	// If we have multiple drivers with the same minimum workload, randomize selection
	var candidateDrivers []string
	for _, dl := range workloadSlice {
		if dl.Workload == minWorkload {
			candidateDrivers = append(candidateDrivers, dl.ID)
		}
	}

	if len(candidateDrivers) > 1 {
		// Simple randomization based on order ID (not truly random but should distribute better)
		// Using the last character of the order ID as a simple hash
		if len(orderIDStr) > 0 {
			lastChar := orderIDStr[len(orderIDStr)-1]
			index := int(lastChar) % len(candidateDrivers)
			selectedDriverID = candidateDrivers[index]
			log.Printf("Multiple drivers with same workload (%d). Selected driver %s using simple randomization", 
				minWorkload, selectedDriverID)
		}
	}

	// Create an AssignRider record
	ar := model.AssignRider{
		RiderID:               &selectedDriverID,
		OrderID:               &orderIDStr,
		EstimatedDeliveryDate: order.EstimatedDeliveryDate,
	}

	if err := tx.Create(&ar).Error; err != nil {
		return fmt.Errorf("failed to assign rider: %v", err)
	}

	// Update order status to ASSIGNED
	order.Status = "ASSIGNED"
	if err := tx.Save(order).Error; err != nil {
		return fmt.Errorf("failed to update order status: %v", err)
	}

	log.Println("Order assigned to driver with least workload:", selectedDriverID, "Current workload:", minWorkload)
	return nil
}
