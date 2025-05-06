Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # NOTE: doing this just for the test. Blanket allow all origins should generally be avoided.
  allow do
    origins "*"
    resource "*", headers: :any, methods: [ :get, :post, :patch, :put ]
  end
end
