# == Schema Information
#
# Table name: provider_clients
#
#  id          :integer          not null, primary key
#  client_id   :integer
#  provider_id :integer
#  plan        :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_provider_clients_on_client_id                  (client_id)
#  index_provider_clients_on_provider_id                (provider_id)
#  index_provider_clients_on_provider_id_and_client_id  (provider_id,client_id) UNIQUE
#

require "test_helper"

class ProviderClientTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
