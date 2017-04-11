ruby '2.4.1'
source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails',       '~> 5.1.0.rc1'
gem 'pg',          github: 'ged/ruby-pg'
gem 'puma',        github: 'puma/puma'
gem 'foreman',     github: 'ddollar/foreman'
gem 'webpacker',   github: 'rails/webpacker'
gem 'jbuilder',    github: 'rails/jbuilder' 
gem 'uglifier'
gem 'slim-rails',  github: 'slim-template/slim-rails'
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

group :development do
  gem 'listen', '>= 3.0.5', '< 3.2'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :development, :test do
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
  gem 'sqlite3'
end
# gem 'rack-cors'
# gem 'redis', '~> 3.0'
# gem 'bcrypt', '~> 3.1.7'
# gem 'capistrano-rails', group: :development
