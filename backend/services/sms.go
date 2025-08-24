package services

import (
	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

type SMSService struct {
	client *twilio.RestClient
	from   string
}

func NewSMSService(accountSID, authToken, fromPhone string) *SMSService {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSID,
		Password: authToken,
	})

	return &SMSService{
		client: client,
		from:   fromPhone,
	}
}

func (s *SMSService) SendSMS(to, message string) error {
	params := &twilioApi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(s.from)
	params.SetBody(message)

	_, err := s.client.Api.CreateMessage(params)
	return err
}
