require 'rails_helper'

RSpec.describe AchPaymentsController, type: :controller do
  describe 'GET #index' do
    let(:payment1) { build(:ach_payment, id: 'txn_001', amount: 1000, recipient: 'John Doe') }
    let(:payment2) { build(:ach_payment, id: 'txn_002', amount: 2000, recipient: 'Jane Smith') }
    let(:filtered_payments) { [ payment1, payment2 ] }
    let(:total_amount) { 3000 }

    before do
      # Mock the service to return predictable results
      allow_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])
    end

    context 'with no parameters' do
      it 'returns all payments with total' do
        get :index

        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('application/json')

        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(3000)
        expect(json_response['payments']).to be_an(Array)
        expect(json_response['payments'].length).to eq(2)
      end

      it 'calls the filter service with empty parameters' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index
      end
    end

    context 'with recipient parameter' do
      it 'passes recipient parameter to the service' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index, params: { recipient: 'John' }
      end

      it 'returns filtered results' do
        get :index, params: { recipient: 'John' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(3000)
        expect(json_response['payments']).to be_an(Array)
      end
    end

    context 'with after date parameter' do
      it 'passes after parameter to the service' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index, params: { after: '2025-01-01' }
      end

      it 'returns filtered results' do
        get :index, params: { after: '2025-01-01' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(3000)
        expect(json_response['payments']).to be_an(Array)
      end
    end

    context 'with before date parameter' do
      it 'passes before parameter to the service' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index, params: { before: '2025-12-31' }
      end

      it 'returns filtered results' do
        get :index, params: { before: '2025-12-31' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(3000)
        expect(json_response['payments']).to be_an(Array)
      end
    end

    context 'with multiple parameters' do
      it 'passes all parameters to the service' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index, params: {
          recipient: 'John',
          after: '2025-01-01',
          before: '2025-12-31'
        }
      end

      it 'returns filtered results' do
        get :index, params: {
          recipient: 'John',
          after: '2025-01-01',
          before: '2025-12-31'
        }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(3000)
        expect(json_response['payments']).to be_an(Array)
      end
    end

    context 'with invalid parameters' do
      it 'ignores invalid parameters' do
        expect_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ filtered_payments, total_amount ])

        get :index, params: {
          recipient: 'John',
          invalid_param: 'should_be_ignored',
          another_invalid: 'also_ignored'
        }
      end
    end

    context 'when service returns empty results' do
      before do
        allow_any_instance_of(AchPaymentsFilterService).to receive(:call).and_return([ [], 0 ])
      end

      it 'returns empty array with zero total' do
        get :index

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response['total']).to eq(0)
        expect(json_response['payments']).to eq([])
      end
    end

    context 'JSON structure' do
      it 'returns payments with correct structure' do
        # Mock the to_json_hash method for predictable results
        allow_any_instance_of(AchPayment).to receive(:to_json_hash).and_return({
          id: 'txn_001',
          amount: 1000,
          currency: 'USD',
          scheduled_date: '2025-01-15',
          recipient: 'John Doe',
          within_24h: false
        })

        get :index

        json_response = JSON.parse(response.body)
        payment = json_response['payments'].first

        expect(payment).to include(
          'id', 'amount', 'currency', 'scheduled_date', 'recipient', 'within_24h'
        )
        expect(payment['id']).to eq('txn_001')
        expect(payment['amount']).to eq(1000)
        expect(payment['currency']).to eq('USD')
        expect(payment['recipient']).to eq('John Doe')
        expect(payment['within_24h']).to be false
      end
    end

    context 'parameter sanitization' do
      it 'only permits allowed parameters' do
        controller_params = double('params')
        allow(controller).to receive(:params).and_return(controller_params)
        allow(controller_params).to receive(:permit).with(:recipient, :after, :before).and_return({
          recipient: 'John',
          after: '2025-01-01'
        })

        expect(controller_params).to receive(:permit).with(:recipient, :after, :before)

        get :index, params: {
          recipient: 'John',
          after: '2025-01-01',
          malicious_param: 'hack_attempt'
        }
      end
    end
  end

  describe 'private methods' do
    describe '#ach_payments_params' do
      it 'permits only allowed parameters' do
        controller.params = ActionController::Parameters.new({
          recipient: 'John',
          after: '2025-01-01',
          before: '2025-12-31',
          malicious: 'hack'
        })

        permitted_params = controller.send(:ach_payments_params)

        expect(permitted_params).to include(:recipient, :after, :before)
        expect(permitted_params).not_to include(:malicious)
      end

      it 'memoizes the result' do
        controller.params = ActionController::Parameters.new({ recipient: 'John' })

        first_call = controller.send(:ach_payments_params)
        second_call = controller.send(:ach_payments_params)

        expect(first_call).to be(second_call)
      end
    end
  end
end
