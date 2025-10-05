# Create a test class that mimics AchPayment behavior
class TestAchPayment
  attr_accessor :id, :amount, :currency, :scheduled_date, :recipient

  def initialize(attributes = {})
    @id = attributes[:id] || "txn_#{SecureRandom.hex(4)}"
    @amount = attributes[:amount] || 1000
    @currency = attributes[:currency] || "USD"
    @scheduled_date = attributes[:scheduled_date] || Date.current
    @recipient = attributes[:recipient] || "Test Recipient"
  end

  def within_24h
    time_diff = Time.parse(scheduled_date.to_s) - Time.current
    time_diff >= 0 && time_diff <= 24.hours
  end

  def to_json_hash
    {
      id: id,
      amount: amount,
      currency: currency,
      recipient: recipient,
      within_24h: within_24h,
      scheduled_date: scheduled_date
    }
  end
end

FactoryBot.define do
  factory :ach_payment, class: TestAchPayment do
    sequence(:id) { |n| "txn_#{n.to_s.rjust(3, '0')}" }
    amount { Faker::Number.between(from: 100, to: 50000) }
    currency { "USD" }
    scheduled_date { Faker::Date.forward(days: 30) }
    recipient { Faker::Name.name }

    trait :within_24h do
      scheduled_date { Date.current + 1.day }
    end

    trait :past_date do
      scheduled_date { Faker::Date.backward(days: 30) }
    end

    trait :future_date do
      scheduled_date { Faker::Date.forward(days: 30) }
    end
  end
end
