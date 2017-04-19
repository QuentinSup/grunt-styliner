
module.exports = function(grunt) {
  'use strict';
  
  //overriding winson's logger
  var util = require('util');
  var winston = require('winston');
  
  var CustomGruntLogger = winston.transports.CustomGruntLogger = function (options) {
	  //
	  // Name this logger
	  //
	  this.name = 'customGruntLogger';

	  //
	  // Set the level from your options
	  //
	  this.level = options.level || 'info';
  };
  
  util.inherits(CustomGruntLogger, winston.Transport);
  
  CustomGruntLogger.prototype.gruntLevelTable = {
		  'silly': {sub: 'verbose', level: 'writeln'},
		  'debug': {sub: 'verbose', level: 'writeln'},
		  'verbose': {sub: 'verbose', level: 'writeln'},
		  'info': {level: 'writeln'},
		  'warn': {level: 'error'},
		  'error': {sub: 'fail', level: 'warn'}
  };
  
  CustomGruntLogger.prototype.log = function (level, msg, meta, callback) {
	  if(!!this.gruntLevelTable[level].sub){
		  grunt[this.gruntLevelTable[level].sub][this.gruntLevelTable[level].level](msg);
	  }else{
		  grunt[this.gruntLevelTable[level].level](msg);
	  }
	  
	  callback(null, true);
  };
  
  //switch logger
  winston.add(winston.transports.CustomGruntLogger, { filename: 'debug.log' });
  winston.remove(winston.transports.Console);
  
  var Styliner = require('styliner');
  grunt.registerMultiTask('styliner', '', function(){
	  var options = this.options({});
      
      // Iterate over all specified file groups.
      this.files.forEach(function(file) {
    	  // Concat specified files.
    	  file.src.filter(function(filepath) {
    		  // Warn on and remove invalid source files (if nonull was set).
    		  if (!grunt.file.exists(filepath)) {
    			  grunt.log.warn('Source file "' + filepath + '" not found.');
    			  return false;
    		  }
    		  return true;
    	  }).forEach(function(filepath) {
    		  var styliner = new Styliner(filepath.substring(0, filepath.length - filepath.split("/").pop().length), options);
    		  styliner.processHTML(grunt.file.read(filepath)).then(function(html){
    			  grunt.file.write(file.dest, html);
    			  grunt.log.writeln('File "' + file.dest + '" processed.');
    		  }).catch(function(err){
    			  return grunt.fail.warn(err+" in "+filepath);
    		  }).done();
    	  });
      });
  });
};
