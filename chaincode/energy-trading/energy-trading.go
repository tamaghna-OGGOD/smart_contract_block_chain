package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for energy trading
type SmartContract struct {
	contractapi.Contract
}

// EnergyToken describes a unit of energy for trading
type EnergyToken struct {
	ID            string  `json:"id"`
	Owner         string  `json:"owner"`
	Producer      string  `json:"producer"`
	EnergyAmount  float64 `json:"energyAmount"`  // in kWh
	Price         float64 `json:"price"`         // in USD
	SourceType    string  `json:"sourceType"`    // solar, wind, etc.
	CreatedAt     string  `json:"createdAt"`
	ForSale       bool    `json:"forSale"`
	CertifiedGreen bool   `json:"certifiedGreen"`
}

// InitLedger adds sample data to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	energyTokens := []EnergyToken{
		{
			ID:            "token1",
			Owner:         "user1",
			Producer:      "solarfarm1",
			EnergyAmount:  5.5,
			Price:         2.2,
			SourceType:    "solar",
			CreatedAt:     time.Now().Format(time.RFC3339),
			ForSale:       true,
			CertifiedGreen: true,
		},
		{
			ID:            "token2",
			Owner:         "user2",
			Producer:      "windfarm1",
			EnergyAmount:  3.0,
			Price:         1.5,
			SourceType:    "wind",
			CreatedAt:     time.Now().Format(time.RFC3339),
			ForSale:       false,
			CertifiedGreen: true,
		},
	}

	for _, token := range energyTokens {
		tokenJSON, err := json.Marshal(token)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(token.ID, tokenJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state: %v", err)
		}
	}

	return nil
}

// CreateToken issues a new energy token to the world state
func (s *SmartContract) CreateToken(ctx contractapi.TransactionContextInterface, id string, owner string, 
	producer string, energyAmount float64, price float64, sourceType string, forSale bool, certifiedGreen bool) error {
	
	exists, err := s.TokenExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the token %s already exists", id)
	}

	token := EnergyToken{
		ID:            id,
		Owner:         owner,
		Producer:      producer,
		EnergyAmount:  energyAmount,
		Price:         price,
		SourceType:    sourceType,
		CreatedAt:     time.Now().Format(time.RFC3339),
		ForSale:       forSale,
		CertifiedGreen: certifiedGreen,
	}

	tokenJSON, err := json.Marshal(token)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, tokenJSON)
}

// ReadToken returns the energy token stored in the world state with given id
func (s *SmartContract) ReadToken(ctx contractapi.TransactionContextInterface, id string) (*EnergyToken, error) {
	tokenJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if tokenJSON == nil {
		return nil, fmt.Errorf("the token %s does not exist", id)
	}

	var token EnergyToken
	err = json.Unmarshal(tokenJSON, &token)
	if err != nil {
		return nil, err
	}

	return &token, nil
}

// UpdateToken updates an existing token in the world state
func (s *SmartContract) UpdateToken(ctx contractapi.TransactionContextInterface, id string, 
	owner string, price float64, forSale bool) error {
	
	token, err := s.ReadToken(ctx, id)
	if err != nil {
		return err
	}

	// Only update specified fields
	if owner != "" {
		token.Owner = owner
	}
	if price > 0 {
		token.Price = price
	}
	token.ForSale = forSale

	tokenJSON, err := json.Marshal(token)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, tokenJSON)
}

// TokenExists returns true when token with given ID exists in world state
func (s *SmartContract) TokenExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	tokenJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return tokenJSON != nil, nil
}

// TransferToken updates the owner field of token with given id in world state
func (s *SmartContract) TransferToken(ctx contractapi.TransactionContextInterface, id string, newOwner string) error {
	token, err := s.ReadToken(ctx, id)
	if err != nil {
		return err
	}

	if !token.ForSale {
		return fmt.Errorf("token %s is not for sale", id)
	}

	token.Owner = newOwner
	token.ForSale = false

	tokenJSON, err := json.Marshal(token)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, tokenJSON)
}

// GetAllTokens returns all energy tokens found in world state
func (s *SmartContract) GetAllTokens(ctx contractapi.TransactionContextInterface) ([]*EnergyToken, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var tokens []*EnergyToken
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var token EnergyToken
		err = json.Unmarshal(queryResponse.Value, &token)
		if err != nil {
			return nil, err
		}
		tokens = append(tokens, &token)
	}

	return tokens, nil
}

// GetTokensByOwner queries for tokens based on owner
func (s *SmartContract) GetTokensByOwner(ctx contractapi.TransactionContextInterface, owner string) ([]*EnergyToken, error) {
	allTokens, err := s.GetAllTokens(ctx)
	if err != nil {
		return nil, err
	}

	var ownerTokens []*EnergyToken
	for _, token := range allTokens {
		if token.Owner == owner {
			ownerTokens = append(ownerTokens, token)
		}
	}

	return ownerTokens, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating energy trading chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting energy trading chaincode: %s", err.Error())
	}
}