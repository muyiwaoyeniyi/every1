class AchPaymentsFilterService
  attr_reader :recipient_filter, :after_date, :before_date

  def initialize(params)
    @recipient_filter = params[:recipient]
    @after_date = params[:after]
    @before_date = params[:before]
  end

  def call
    filtered_payments = []
    total_amount = 0

    # Run filters and calculate total amount in one pass
    AchPayment.all.each do |payment|
      if matches_filters?(payment)
        filtered_payments << payment
        total_amount += payment.amount
      end
    end

    [ filtered_payments, total_amount ]
  end

  private

  def matches_filters?(payment)
    recipient_match?(payment) && after_date_match?(payment) && before_date_match?(payment)
  end

  def recipient_match?(payment)
    recipient_filter.blank? ||
      payment.recipient.downcase.include?(recipient_filter.downcase)
  end

  def after_date_match?(payment)
    return true if after_date.blank?

    parsed_after_date = Date.parse(after_date)
    payment_date = payment.scheduled_date.is_a?(Date) ? payment.scheduled_date : Date.parse(payment.scheduled_date.to_s)
    payment_date >= parsed_after_date
  end

  def before_date_match?(payment)
    return true if before_date.blank?

    parsed_before_date = Date.parse(before_date)
    payment_date = payment.scheduled_date.is_a?(Date) ? payment.scheduled_date : Date.parse(payment.scheduled_date.to_s)
    payment_date <= parsed_before_date
  end
end
