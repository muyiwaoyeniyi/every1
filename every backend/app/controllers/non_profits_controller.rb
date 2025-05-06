class NonProfitsController < ApplicationController
  def index
    @non_profits = EveryApi.get_non_profits(params[:search_term] || "")
    render json: @non_profits
  end
end
