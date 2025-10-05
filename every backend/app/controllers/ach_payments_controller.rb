class AchPaymentsController < ApplicationController
  # NOTE: For future improvement, support pagination
  def index
    filtered_payments, total_amount = AchPaymentsFilterService.new(ach_payments_params).call
    render json: {
      total: total_amount,
      payments: filtered_payments.map(&:to_json_hash)
    }
  end

  private

  def ach_payments_params
    @ach_payments_params ||= params.permit(:recipient, :after, :before)
  end
end
