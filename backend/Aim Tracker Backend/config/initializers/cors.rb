Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Добавляем порт 5174, так как ваш Vite запущен именно на нем
    origins 'http://localhost:5173', 'http://127.0.0.1:5173',
            'http://localhost:5174', 'http://127.0.0.1:5174'

    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head],
             credentials: true
  end
end

