RSpec.describe 'options page', type: :feature do
  it 'loads' do
    visit 'extension/options.html'

    expect(page).to have_css('h1', text: 'Hubnav Options')
  end

  it 'allows adding a repository' do
    visit 'extension/options.html'

    expect(page).not_to have_css('#repositories-container .repository-container')

    # find_button('Add a repository shortcut').trigger('click')
    click_button 'Add a repository shortcut'

    expect(page).to have_css('#repositories-container .repository-container')
  end
end
