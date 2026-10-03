ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Отключаем автоматическую загрузку всех фикстур
    self.fixture_paths = [] if respond_to?(:fixture_paths)
    # Или так, для разных версий:
    # self.fixture_path = nil
  end
end
