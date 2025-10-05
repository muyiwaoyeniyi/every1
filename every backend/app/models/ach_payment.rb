class AchPayment < ActiveJSON::Base
  set_root_path Rails.root.join("app", "models", "data")
  set_filename "ach_payments"

  def within_24h
    time_diff = Time.parse(scheduled_date.to_s) - Time.current

    # Check if the payment is scheduled within the next 24 hours
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
