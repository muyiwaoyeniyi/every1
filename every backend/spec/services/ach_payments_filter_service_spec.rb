require 'rails_helper'

RSpec.describe AchPaymentsFilterService, type: :service do
  let(:service) { described_class.new(params) }
  let(:params) { {} }

  describe '#initialize' do
    it 'sets the filter parameters' do
      params = { recipient: 'John', after: '2025-01-01', before: '2025-12-31' }
      service = described_class.new(params)

      expect(service.recipient_filter).to eq('John')
      expect(service.after_date).to eq('2025-01-01')
      expect(service.before_date).to eq('2025-12-31')
    end
  end

  describe '#call' do
    let!(:payment1) { build(:ach_payment, recipient: 'John Doe', amount: 1000, scheduled_date: Date.parse('2025-01-15')) }
    let!(:payment2) { build(:ach_payment, recipient: 'Jane Smith', amount: 2000, scheduled_date: Date.parse('2025-02-15')) }
    let!(:payment3) { build(:ach_payment, recipient: 'John Smith', amount: 3000, scheduled_date: Date.parse('2025-03-15')) }

    before do
      # Mock AchPayment.all to return our test payments
      allow(AchPayment).to receive(:all).and_return([ payment1, payment2, payment3 ])
    end

    context 'with no filters' do
      it 'returns all payments and correct total' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1, payment2, payment3)
        expect(total_amount).to eq(6000)
      end
    end

    context 'with recipient filter' do
      let(:params) { { recipient: 'John' } }

      it 'filters by recipient (case-insensitive)' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1, payment3)
        expect(total_amount).to eq(4000)
      end

      it 'returns empty results for non-matching recipient' do
        params[:recipient] = 'NonExistent'
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to be_empty
        expect(total_amount).to eq(0)
      end

      it 'handles empty recipient filter' do
        params[:recipient] = ''
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1, payment2, payment3)
        expect(total_amount).to eq(6000)
      end
    end

    context 'with after date filter' do
      let(:params) { { after: '2025-02-01' } }

      it 'filters payments after the specified date' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment2, payment3)
        expect(total_amount).to eq(5000)
      end

      it 'includes payments on the exact date' do
        params[:after] = '2025-02-15'
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment2, payment3)
        expect(total_amount).to eq(5000)
      end
    end

    context 'with before date filter' do
      let(:params) { { before: '2025-02-01' } }

      it 'filters payments before the specified date' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1)
        expect(total_amount).to eq(1000)
      end

      it 'includes payments on the exact date' do
        params[:before] = '2025-01-15'
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1)
        expect(total_amount).to eq(1000)
      end
    end

    context 'with multiple filters' do
      let(:params) { { recipient: 'John', after: '2025-01-01' } }

      it 'applies all filters with AND logic' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1, payment3)
        expect(total_amount).to eq(4000)
      end

      it 'returns empty results when no payments match all filters' do
        params[:recipient] = 'Jane'
        params[:after] = '2025-03-01'

        filtered_payments, total_amount = service.call

        expect(filtered_payments).to be_empty
        expect(total_amount).to eq(0)
      end
    end

    context 'with both after and before filters' do
      let(:params) { { after: '2025-01-01', before: '2025-02-28' } }

      it 'applies both date filters' do
        filtered_payments, total_amount = service.call

        expect(filtered_payments).to contain_exactly(payment1, payment2)
        expect(total_amount).to eq(3000)
      end
    end

    context 'with invalid date formats' do
      let(:params) { { after: 'invalid-date' } }

      it 'raises an error for invalid date format' do
        expect { service.call }.to raise_error(Date::Error)
      end
    end
  end

  describe 'private methods' do
    let(:payment) { build(:ach_payment, recipient: 'John Doe', scheduled_date: Date.parse('2025-01-15')) }

    describe '#recipient_match?' do
      context 'when recipient filter is blank' do
        let(:params) { { recipient: '' } }

        it 'returns true' do
          expect(service.send(:recipient_match?, payment)).to be true
        end
      end

      context 'when recipient matches' do
        let(:params) { { recipient: 'john' } }

        it 'returns true (case-insensitive)' do
          expect(service.send(:recipient_match?, payment)).to be true
        end
      end

      context 'when recipient does not match' do
        let(:params) { { recipient: 'jane' } }

        it 'returns false' do
          expect(service.send(:recipient_match?, payment)).to be false
        end
      end
    end

    describe '#after_date_match?' do
      context 'when after_date is blank' do
        let(:params) { { after: '' } }

        it 'returns true' do
          expect(service.send(:after_date_match?, payment)).to be true
        end
      end

      context 'when payment date is after the filter date' do
        let(:params) { { after: '2025-01-01' } }

        it 'returns true' do
          expect(service.send(:after_date_match?, payment)).to be true
        end
      end

      context 'when payment date is before the filter date' do
        let(:params) { { after: '2025-02-01' } }

        it 'returns false' do
          expect(service.send(:after_date_match?, payment)).to be false
        end
      end
    end

    describe '#before_date_match?' do
      context 'when before_date is blank' do
        let(:params) { { before: '' } }

        it 'returns true' do
          expect(service.send(:before_date_match?, payment)).to be true
        end
      end

      context 'when payment date is before the filter date' do
        let(:params) { { before: '2025-02-01' } }

        it 'returns true' do
          expect(service.send(:before_date_match?, payment)).to be true
        end
      end

      context 'when payment date is after the filter date' do
        let(:params) { { before: '2025-01-01' } }

        it 'returns false' do
          expect(service.send(:before_date_match?, payment)).to be false
        end
      end
    end
  end
end
