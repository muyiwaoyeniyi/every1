require 'rails_helper'

RSpec.describe AchPayment, type: :model do
  describe 'data integrity' do
    it 'has the correct root path set' do
      expect(AchPayment.root_path).to eq(Rails.root.join("app", "models", "data"))
    end

    it 'loads data from the correct file' do
      expect(File.exist?(AchPayment.root_path.join("ach_payments.json"))).to be true
    end
  end

  describe 'class methods' do
    describe '.all' do
      it 'returns all payments from the JSON file' do
        # This test assumes the JSON file exists and has data
        payments = AchPayment.all
        expect(payments).to be_an(ActiveHash::Relation)
        expect(payments.first).to be_an(AchPayment)
      end
    end
  end

  describe 'instance methods' do
    let(:payment) { AchPayment.all.first }

    describe '#within_24h' do
      context 'when payment is scheduled within 24 hours' do
        it 'returns true for payment scheduled today' do
          # Mock Time.current to a specific time
          current_time = Time.parse('2025-10-04')
          allow(Time).to receive(:current).and_return(current_time)
          payment = build(:ach_payment, scheduled_date: Date.parse('2025-10-04'))
          # The test payment should be within 24 hours since it's scheduled for today
          expect(payment.within_24h).to be true
        end

        it 'returns true for payment scheduled tomorrow' do
          allow(Time).to receive(:current).and_return(Time.parse('2025-10-04'))
          payment = build(:ach_payment, scheduled_date: Date.parse('2025-10-05'))
          expect(payment.within_24h).to be true
        end
      end

      context 'when payment is scheduled more than 24 hours away' do
        it 'returns false for payment scheduled in 2 days' do
          allow(Time).to receive(:current).and_return(Time.parse('2025-10-04'))
          payment = build(:ach_payment, scheduled_date: Date.parse('2025-10-06'))
          expect(payment.within_24h).to be false
        end

        it 'returns false for payment scheduled in the past' do
          allow(Time).to receive(:current).and_return(Time.parse('2025-10-04'))
          payment = build(:ach_payment, scheduled_date: Date.parse('2025-10-03'))
          expect(payment.within_24h).to be false
        end
      end
    end

    describe '#to_json_hash' do
      it 'returns a hash with all required attributes' do
        payment = build(:ach_payment,
          id: 'txn_001',
          amount: 5000,
          currency: 'USD',
          scheduled_date: Date.parse('2025-10-05'),
          recipient: 'John Doe'
        )

        result = payment.to_json_hash

        expect(result).to include(
          id: 'txn_001',
          amount: 5000,
          currency: 'USD',
          scheduled_date: Date.parse('2025-10-05'),
          recipient: 'John Doe',
          within_24h: be_in([ true, false ])
        )
      end

      it 'includes the within_24h calculation' do
        payment = build(:ach_payment, scheduled_date: Date.parse('2025-10-06'))

        result = payment.to_json_hash

        expect(result).to have_key(:within_24h)
        expect(result[:within_24h]).to be_in([ true, false ])
      end

      it 'does not include the attributes key' do
        payment = build(:ach_payment)

        result = payment.to_json_hash

        expect(result).not_to have_key(:attributes)
      end
    end
  end
end
