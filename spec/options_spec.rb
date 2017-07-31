RSpec.describe 'options page', type: :request do
  it 'loads' do
    visit 'extension/options.html'

    expect(page).to have_css('h1', text: 'Hubnav Options')
  end
end
