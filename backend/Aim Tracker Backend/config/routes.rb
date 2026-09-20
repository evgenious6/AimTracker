Rails.application.routes.draw do
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  get '/logged_in', to: 'sessions#logged_in'
  post '/register', to: 'users#create'

  # Это нужно, чтобы Rails понимал, что если нет базы, её не надо ломать
  root to: proc { [200, {}, ['Aim Tracker API is running']] }
end