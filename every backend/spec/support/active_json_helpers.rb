# Helper methods for testing ActiveJSON models

module ActiveJsonHelpers
  def create_ach_payment(attributes = {})
    # Create a temporary payment object for testing
    # Since ActiveJSON doesn't support traditional creation, we'll mock the behavior
    payment = AchPayment.new(attributes)
    allow(payment).to receive(:id).and_return(attributes[:id] || SecureRandom.hex(4))
    allow(payment).to receive(:amount).and_return(attributes[:amount] || 1000)
    allow(payment).to receive(:currency).and_return(attributes[:currency] || 'USD')
    allow(payment).to receive(:scheduled_date).and_return(attributes[:scheduled_date] || Date.current)
    allow(payment).to receive(:recipient).and_return(attributes[:recipient] || 'Test Recipient')
    payment
  end

  def mock_ach_payments_collection(payments)
    allow(AchPayment).to receive(:all).and_return(payments)
  end
end

RSpec.configure do |config|
  config.include ActiveJsonHelpers
end
