# typescript-gulp-browserify-browsersync-template

Author - [vitprog@gmail.com](mailto://vitprog@gmail.com)
## System requirements

Install NodeJs:
```
sudo curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs
```

Install Gulp:
```
sudo npm install gulp -g
```

Install Karma:
```
sudo npm install karma -g
```

Install Typings:
```
sudo npm install typings -g
```

## Components

* gulp
* karma
* jasmine
* typescript
* browserify
* browserSync

## Get start:
```
git clone https://github.com/VitProg/typescript-gulp-browserify-browsersync-template.git
сd typescript-gulp-browserify-browsersync-template
npm install
typings install dt~jasmine --save --global
```

## Gulp commands

* `gulp` and `gulp build` - build project
* `gulp clean` - clean build directory
* `gulp server` - run browserSync server and open project in browser
* `gulp watch` - run browserSync server, open project in browser and watch files changes with hot reload
* `gulp test` - run unit tests

