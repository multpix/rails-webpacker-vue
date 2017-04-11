![rails/webpack](https://cdn-images-1.medium.com/max/1400/1*cy8AeRsOoHYG2GNxRYJ8VQ.png)

# Пример Rails приложения с Webpacker и Vue.js #

>по мотивам статьи:
>

Для Rails 5.1, с ключем `--webpack`, ожидается первоклассная поддержка [Webpack](https://webpack.js.org/)
а так же интеграция с **React**, **Angular** и **Vue** из коробки.

В этом примере -
немного о свежей версии [Webpacker](https://github.com/rails/webpacker)
и его возможностях, простая инреграция `Vue.js`

**Изначальные условия**

- Bash
- Git
- JavaScript
- Node
- Yarn
- Webpack
- Ruby 2.4.1
- Rails 5+

## Установка ##

На вашей машине должны быть установленны `ruby`, `node` и `yarn`.

Начнем с создания нового `Rails 5.1` приложения.

Откройте терминал и выполните следующие команды в директории по вашему выбору:

```bash
mkdir rails-webpacker
cd rails-webpacker
cat > Gemfile <<END_CONF
source 'https://rubygems.org'
ruby '2.4.1'
gem 'rails', github: 'rails/rails'
END_CONF
bundle
```

Так, в текущей директории будет создан `Gemfile`, полученна свежая версия `Rails`.

Тут же выполним установку нового Rails приложения:

```bash
bundle exec rails new . --dev --force --webpack
```

Изящный ключ `--webpack`, после создания Rails 5.1 приложения,
установит `webpack` и `Yarn`.

Проверте `Gemfile`, и при необходимости, уточните следующие строки:

```ruby
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
```

Установка зависимостей: `bundle update`

Интегрировать Vue.js в существующее приложение, можно следующим образом:

```bash
rails webpacker:install:vue
```

Дополнительные пакеты `js`:

```javascript
{
  "name": "app",
  "private": true,
  "dependencies": {
    "autoprefixer": "^6.7.7",
    "babel-core": "^6.24.1",
    "babel-loader": "^6.4.1",
    "babel-preset-env": "^1.3.3",
    "coffee-loader": "^0.7.3",
    "coffee-script": "^1.12.4",
    "compression-webpack-plugin": "^0.4.0",
    "css-loader": "^0.28.0",
    "extract-text-webpack-plugin": "^2.1.0",
    "file-loader": "^0.11.1",
    "glob": "^7.1.1",
    "js-yaml": "^3.8.3",
    "node-sass": "^4.5.2",
    "path-complete-extname": "^0.1.0",
    "postcss-loader": "^1.3.3",
    "postcss-smart-import": "^0.6.11",
    "precss": "^1.4.0",
    "pug": "^2.0.0-beta11",
    "pug-loader": "^2.3.0",
    "rails-erb-loader": "^5.0.0",
    "sass-loader": "^6.0.3",
    "style-loader": "^0.16.1",
    "stylus": "^0.54.5",
    "stylus-loader": "^3.0.1",
    "vue": "^2.2.6",
    "vue-loader": "^11.3.4",
    "vue-template-compiler": "^2.2.6",
    "webpack": "^2.3.3",
    "webpack-manifest-plugin": "^1.1.0",
    "webpack-merge": "^4.1.0"
  },
  "devDependencies": {
    "webpack-dev-server": "^2.4.2"
  }
}
```

## Конфигурация ##

Как и все в Rails, webpack следует поределенным соглашениям

### 1. Структура каталогов ###

Обратите внимание на каталог `app/javascript`.
Он содержит весь *JavaScript* код приложения и вхождения *webpack*.

По соглашению, модули размещаются в каталоге `app/javascript`,
все вхождения webpack должны быть размещены в каталоге `app/javascript/packs`.

По умолчанию, в демонстрационных целях,
webpacker генерирует `application.js` внутри каталога `packs`.

### 2. Конфигурация Webpack ###

Также, для каждой среды, генератор  создает конфигурации webpack,
расположенные в директории `config/webpack`.

#### shared.js ####

```javascript
const webpack = require('webpack')
const { basename, dirname, join, relative, resolve } = require('path')
const { sync } = require('glob')
const { readdirSync } = require('fs')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const extname = require('path-complete-extname')
const { env, paths, publicPath, loadersDir } = require('./configuration.js')

const extensionGlob = `**/*{${paths.extensions.join(',')}}*`
const packPaths = sync(join(paths.source, paths.entry, extensionGlob))

module.exports = {
  entry: packPaths.reduce(
    (map, entry) => {
      const localMap = map
      const namespace = relative(join(paths.source, paths.entry), dirname(entry))
      localMap[join(namespace, basename(entry, extname(entry)))] = resolve(entry)
      return localMap
    }, {}
  ),

  output: { filename: '[name].js', path: resolve(paths.output, paths.entry) },

  module: {
    rules: readdirSync(loadersDir).map(file => (
      require(join(loadersDir, file))
    ))
  },

  plugins: [
    new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(env))),
    new ExtractTextPlugin(env.NODE_ENV === 'production' ? '[name]-[hash].css' : '[name].css'),
    new ManifestPlugin({ fileName: paths.manifest, publicPath, writeToFileEmit: true })
  ],

  resolve: {
    extensions: paths.extensions,
    modules: [
      resolve(paths.source),
      resolve(paths.node_modules)
    ]
  },

  resolveLoader: {
    modules: [paths.node_modules]
  }
}
```
Общий конфигурационный файл содержит базовую конфигурацию webpack,
обратите внимание на `glob`, которая проверяет все каталоги `pack`,
ищет любые файлы с расширением `*.js` и устанавливает их как точки входа.

Конечно, вы можете изменить имя директории так, как необходимо вашему приложению.

Так же,  обратите внимание на `rails-erb-loader`,
так мы можем связать *sprocket* ресурсы с JavaScript файлами,
для этого достаточно просто добавить их с расширением `.erb`.

```erb
// app/javascript/calendar/calendar.js.erb

<% helpers = ActionController::Base.helpers %>
var calendarIcon = "<%= helpers.image_path('calendar-icon.png') %>";
```

Остальное, это стандартная конфигурация Webpack2.

#### development.js ####

```javascript
const merge = require('webpack-merge')
const sharedConfig = require('./shared.js')

module.exports = merge(sharedConfig, {
  devtool: 'sourcemap',

  stats: {
    errorDetails: true
  },

  output: {
    pathinfo: true
  }
})
```

Этот файл расширяет стандартную конфигурацию,
и добавляет полезные для режима разработки опции в соответствующую среду.

#### production.js ####

```javascript
const webpack = require('webpack')
const merge = require('webpack-merge')
const CompressionPlugin = require('compression-webpack-plugin')
const sharedConfig = require('./shared.js')

module.exports = merge(sharedConfig, {
  output: { filename: '[name]-[chunkhash].js' },

  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css|svg|eot|ttf|woff|woff2)$/
    })
  ]
})
```

Этот файл так же расширяет базовую конфигурацию,
и содержит нексколько оптимизационных опций для производственной среды.

В действительности, приложение может иметь более тонкие настройки оптимизации,
вы можете указать их, исходя из ваших конкретных условий,
но в качестве отправной точки достаточно и этих.

#### Живая перезагрузка ####

Webpacker предоставляет обертку для запуска `webpack-dev-server`
который поддерживает перезагрузку кода налету в среде разработки.

Просмотрите `environments/development.rb`
и обратите внимание на конфигурацию адреса серврера разработки.

```
config.x.webpacker[:dev_server_host] = “http://localhost:8080"
```

## Применим это на практике ##

### 1. Установка ###

Изначально, для обслуживания нескольких процессов,
в группу разработки в `Gemfile` необходимо добавить [foreman](https://github.com/ddollar/foreman),
собрать зависимости с помощью `bundle install`.

Затем, создать два файла `Procfile` и `Procfile.dev` в корне проекта.

#### Procfile ####

```
web: bundle exec puma -p $PORT
```

#### Procfile.dev ####

```
web: bundle exec rails s
# watcher: ./bin/webpack-watcher
hot: ./bin/webpack-dev-server
```

Кроме того, настроим небольшую обертку для запуска `Procfile.dev`,
создадим файл внутри `bin/*` каталога под названием `server` и вставим в него следующий код:

```
#!/bin/bash -i
bundle install
bundle exec foreman start -f Procfile.dev
```

Сделаем его исполняемым: `chmod +x ./bin/server`.

Теперю мы можем просто выполнить `./bin/server` в корне приложения,
что запустит `Procfile.dev`, обеспечивающий работу `webpack` и `puma`.

### 2. Код приложения ###

Теперь, воспользуемся немного доработанным примером кода,
полученным при установке Vue.js.
Cоберем все вместе, чтоб посмотреть как это работает.

**app/javascript/packs/app.js**

```javascript
/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'
import  Modal from '../components/modal.vue'
document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#app',
    data: { showModal: false },
    components: { Modal }
  })
})
```

в каталоге `app/javascript/components/` содержит однофайловые компоненты `vue`

например: **app/javascript/packs/components/modal.vue**

```vue
<template lang="pug">
transition(name="modal")
  .modal-mask
    .modal-wrapper
      .modal-container
        .modal-header
          slot(name="header") default header
        .modal-body
          slot(name="body") default body
        .modal-footer
          button.modal-default-button(@click="$emit('close')") Close 
</template>

<script>
module.exports = { name: 'modal' }
</script>

<style lang="stylus">
#app
  text-align: center

.modal-mask
  position: fixed
  z-index: 9998
  top: 0
  left: 0
  width: 100%
  height: 100%
  background-color: rgba(0, 0, 0, .5)
  display: table
  transition: opacity .3s ease
  
.modal-wrapper
  display: table-cell
  vertical-align: middle
  
.modal-container
  width: 300px
  margin: 0px auto
  padding: 20px 30px
  background-color: #fff
  border-radius: 2px
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33)
  transition: all .3s ease
  font-family: Helvetica, Arial, sans-serif
  
.modal-header h3
  margin-top: 0
  color: #42b983
  
.modal-body
  margin: 20px 0
  
.modal-enter
  opacity: 0
  
.modal-leave-active
  opacity: 0
  
.modal-enter .modal-container,
.modal-leave-active .modal-container
  transform: scale(1.1)
</style>
```

> Компонент *модального окна* взят из
> [примера](https://ru.vuejs.org/v2/examples/modal.html) в документации `Vue.js`.

### 3.  Представление ###

Напоследок, для добавления этого в представление, сгенерируем контроллер:

```
bundle exec rails g controller front index
```

В `routes.rb` укажем этот экшн как корневой маршрут:

```ruby
root ‘front#index’
```

Главный шаблон приложения `layouts/application.html.slim` следующий:

```slim
doctype html
html
  head
    = render partial: 'layouts/meta'
    = csrf_meta_tags
    = javascript_pack_tag 'app'
  body
    #app
      = yield
```

Обратите внимание на вспомогательную функцию `javascript_pack_tag`,
она будет принимать скомпилированный скрипт,
и выводитть в приложении ссылку на него следующим образом:

```html
<script src=”http://localhost:5000/app.js"></script>
```

Шаблон с пользовательским компонентом

```slim
//app/views/front/index.html.slim`
button(id="show-modal" @click="showModal = true") Show Modal
modal(v-if="showModal" @close="showModal = false")
  h3(slot="header") component Modal
  p(slot="body") Vue.js for Ruby on Rails
```

### 4. Запуск ###

Откроем терминал в текущей директории, и выполгним:

```bash
./bin/server
# или напрямую
bundle exec foreman start -f Procfile.dev
```

Теперь перейдя в браузере по адресу  ` http://localhost:5000/`
мы увидим наше работающее приложение.

## Развертывание ##

Последний но не менее важный этап - выгрузка приложения в рабочую среду.
Мы развернем свое приложение в Heroku.
Большинство настроек аналогично развертке обычного Rails приложения, однако,
така как мы используем Node.js, мы добавим соответствующий пакет сборки
`node.js buildpack`.

```bash
heroku create
heroku addons:create heroku-postgresql:hobby-dev
heroku config:add NPM_CONFIG_PRODUCTION=false
heroku buildpacks:add --index 1 heroku/nodejs
heroku buildpacks:add --index 2 heroku/ruby
```

Выполнение команды `git push heroku master` в корневом каталоге приложения,
выгрузит его на Heroku.

## Ресурсы ##

- [Introduction Webpacker](https://medium.com/statuscode/introducing-webpacker-7136d66cddfb#.si6rwj56t)
- [Webpacker](https://github.com/rails/webpacker): Webpacker gem
- [Webpack 2](https://webpack.js.org/): Webpack официальный сайт
- [Yarn](https://yarnpkg.com/en/): Менеджер пакетов для node

**Больше примеров кода в этих репозиториях**

- https://github.com/gauravtiwari/webpacker-example-app
- https://github.com/gauravtiwari/rails-webpacker
- https://github.com/gauravtiwari/webpacker-vue
