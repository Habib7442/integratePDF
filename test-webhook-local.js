// Quick test to verify webhook endpoint is working
const testWebhook = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/clerk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user.created',
        data: {
          id: 'user_test123',
          email_addresses: [{
            id: 'email_test123',
            email_address: 'test@example.com'
          }],
          primary_email_address_id: 'email_test123',
          first_name: 'Test',
          last_name: 'User',
          image_url: null
        }
      })
    })
    
    console.log('Status:', response.status)
    console.log('Response:', await response.text())
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testWebhook()
