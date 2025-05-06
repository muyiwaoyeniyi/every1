class EveryApi
  def self.get_non_profits(search_term)
    response = HTTParty.get("https://partners.every.org/v0.2/search/#{search_term}?apiKey=#{api_key}")
    response.parsed_response.try(:[], "nonprofits") || []
  rescue StandardError
    # TODO: log to external service like sentry
    []
  end

  # TODO: move this to an env variable or use Rails application credentials file
  def self.api_key
   "pk_live_ce35e2e8c6df5d62223dc772a7784d3c"
  end
end
