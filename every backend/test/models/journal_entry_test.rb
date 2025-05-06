# == Schema Information
#
# Table name: journal_entries
#
#  id         :integer          not null, primary key
#  client_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_journal_entries_on_client_id  (client_id)
#

require "test_helper"

class JournalEntryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
