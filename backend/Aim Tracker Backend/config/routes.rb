Rails.application.routes.draw do
  # Авторизация и регистрация
  post '/login', to: 'sessions#create'
  delete '/logout', to: 'sessions#destroy'
  get '/logged_in', to: 'sessions#logged_in'
  post '/register', to: 'users#create'

  # Это нужно, чтобы Rails понимал, что если нет базы, её не надо ломать
  root to: proc { [200, {}, ['Aim Tracker API is running']] }

  # Маршруты для целей (получить список и создать новую)
  resources :goals, only: [:index, :create]

  # Маршруты для подцелей (прямые, без вложенности, чтобы обойти баг params)
  post '/sub_goals', to: 'sub_goals#create'
  patch '/sub_goals/toggle', to: 'sub_goals#toggle'
end