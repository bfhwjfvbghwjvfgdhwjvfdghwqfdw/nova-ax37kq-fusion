"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const main = require("./main-BE3IRLHr.js");
const require$$1 = require("path");
const require$$2 = require("util");
const require$$0$3 = require("events");
const require$$0$1 = require("child_process");
const require$$1$1 = require("os");
const require$$0 = require("fs");
const require$$0$2 = require("stream");
const require$$0$5 = require("node:util");
const require$$1$3 = require("node:stream");
const require$$0$4 = require("node:child_process");
const require$$1$2 = require("node:crypto");
const path$4 = require("node:path");
const require$$0$6 = require("node:events");
const os = require("node:os");
var utils$2 = { exports: {} };
var windows;
var hasRequiredWindows;
function requireWindows() {
  if (hasRequiredWindows) return windows;
  hasRequiredWindows = 1;
  windows = isexe2;
  isexe2.sync = sync2;
  var fs2 = require$$0;
  function checkPathExt(path2, options) {
    var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
    if (!pathext) {
      return true;
    }
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) {
      return true;
    }
    for (var i = 0; i < pathext.length; i++) {
      var p = pathext[i].toLowerCase();
      if (p && path2.substr(-p.length).toLowerCase() === p) {
        return true;
      }
    }
    return false;
  }
  function checkStat(stat, path2, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) {
      return false;
    }
    return checkPathExt(path2, options);
  }
  function isexe2(path2, options, cb) {
    fs2.stat(path2, function(er, stat) {
      cb(er, er ? false : checkStat(stat, path2, options));
    });
  }
  function sync2(path2, options) {
    return checkStat(fs2.statSync(path2), path2, options);
  }
  return windows;
}
var mode;
var hasRequiredMode;
function requireMode() {
  if (hasRequiredMode) return mode;
  hasRequiredMode = 1;
  mode = isexe2;
  isexe2.sync = sync2;
  var fs2 = require$$0;
  function isexe2(path2, options, cb) {
    fs2.stat(path2, function(er, stat) {
      cb(er, er ? false : checkStat(stat, options));
    });
  }
  function sync2(path2, options) {
    return checkStat(fs2.statSync(path2), options);
  }
  function checkStat(stat, options) {
    return stat.isFile() && checkMode(stat, options);
  }
  function checkMode(stat, options) {
    var mod = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
    var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
    return ret;
  }
  return mode;
}
var core;
if (process.platform === "win32" || main.commonjsGlobal.TESTING_WINDOWS) {
  core = requireWindows();
} else {
  core = requireMode();
}
var isexe_1 = isexe$1;
isexe$1.sync = sync;
function isexe$1(path2, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }
  if (!cb) {
    if (typeof Promise !== "function") {
      throw new TypeError("callback not provided");
    }
    return new Promise(function(resolve, reject) {
      isexe$1(path2, options || {}, function(er, is2) {
        if (er) {
          reject(er);
        } else {
          resolve(is2);
        }
      });
    });
  }
  core(path2, options || {}, function(er, is2) {
    if (er) {
      if (er.code === "EACCES" || options && options.ignoreErrors) {
        er = null;
        is2 = false;
      }
    }
    cb(er, is2);
  });
}
function sync(path2, options) {
  try {
    return core.sync(path2, options || {});
  } catch (er) {
    if (options && options.ignoreErrors || er.code === "EACCES") {
      return false;
    } else {
      throw er;
    }
  }
}
var which_1 = which$1;
which$1.sync = whichSync;
var isWindows$1 = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
var path$3 = require$$1;
var COLON = isWindows$1 ? ";" : ":";
var isexe = isexe_1;
function getNotFoundError(cmd) {
  var er = new Error("not found: " + cmd);
  er.code = "ENOENT";
  return er;
}
function getPathInfo(cmd, opt) {
  var colon = opt.colon || COLON;
  var pathEnv = opt.path || process.env.PATH || "";
  var pathExt = [""];
  pathEnv = pathEnv.split(colon);
  var pathExtExe = "";
  if (isWindows$1) {
    pathEnv.unshift(process.cwd());
    pathExtExe = opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM";
    pathExt = pathExtExe.split(colon);
    if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
      pathExt.unshift("");
  }
  if (cmd.match(/\//) || isWindows$1 && cmd.match(/\\/))
    pathEnv = [""];
  return {
    env: pathEnv,
    ext: pathExt,
    extExe: pathExtExe
  };
}
function which$1(cmd, opt, cb) {
  if (typeof opt === "function") {
    cb = opt;
    opt = {};
  }
  var info = getPathInfo(cmd, opt);
  var pathEnv = info.env;
  var pathExt = info.ext;
  var pathExtExe = info.extExe;
  var found = [];
  (function F(i, l) {
    if (i === l) {
      if (opt.all && found.length)
        return cb(null, found);
      else
        return cb(getNotFoundError(cmd));
    }
    var pathPart = pathEnv[i];
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1);
    var p = path$3.join(pathPart, cmd);
    if (!pathPart && /^\.[\\\/]/.test(cmd)) {
      p = cmd.slice(0, 2) + p;
    }
    (function E(ii, ll) {
      if (ii === ll) return F(i + 1, l);
      var ext = pathExt[ii];
      isexe(p + ext, { pathExt: pathExtExe }, function(er, is2) {
        if (!er && is2) {
          if (opt.all)
            found.push(p + ext);
          else
            return cb(null, p + ext);
        }
        return E(ii + 1, ll);
      });
    })(0, pathExt.length);
  })(0, pathEnv.length);
}
function whichSync(cmd, opt) {
  opt = opt || {};
  var info = getPathInfo(cmd, opt);
  var pathEnv = info.env;
  var pathExt = info.ext;
  var pathExtExe = info.extExe;
  var found = [];
  for (var i = 0, l = pathEnv.length; i < l; i++) {
    var pathPart = pathEnv[i];
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1);
    var p = path$3.join(pathPart, cmd);
    if (!pathPart && /^\.[\\\/]/.test(cmd)) {
      p = cmd.slice(0, 2) + p;
    }
    for (var j = 0, ll = pathExt.length; j < ll; j++) {
      var cur = p + pathExt[j];
      var is2;
      try {
        is2 = isexe.sync(cur, { pathExt: pathExtExe });
        if (is2) {
          if (opt.all)
            found.push(cur);
          else
            return cur;
        }
      } catch (ex) {
      }
    }
  }
  if (opt.all && found.length)
    return found;
  if (opt.nothrow)
    return null;
  throw getNotFoundError(cmd);
}
require$$0$1.exec;
var isWindows = require$$1$1.platform().match(/win(32|64)/);
var which = which_1;
var nlRegexp = /\r\n|\r|\n/g;
var streamRegexp = /^\[?(.*?)\]?$/;
var filterEscapeRegexp = /[,]/;
var whichCache = {};
function parseProgressLine(line) {
  var progress = {};
  line = line.replace(/=\s+/g, "=").trim();
  var progressParts = line.split(" ");
  for (var i = 0; i < progressParts.length; i++) {
    var progressSplit = progressParts[i].split("=", 2);
    var key = progressSplit[0];
    var value = progressSplit[1];
    if (typeof value === "undefined")
      return null;
    progress[key] = value;
  }
  return progress;
}
var utils$1 = utils$2.exports = {
  isWindows,
  streamRegexp,
  /**
   * Copy an object keys into another one
   *
   * @param {Object} source source object
   * @param {Object} dest destination object
   * @private
   */
  copy: function(source, dest) {
    Object.keys(source).forEach(function(key) {
      dest[key] = source[key];
    });
  },
  /**
   * Create an argument list
   *
   * Returns a function that adds new arguments to the list.
   * It also has the following methods:
   * - clear() empties the argument list
   * - get() returns the argument list
   * - find(arg, count) finds 'arg' in the list and return the following 'count' items, or undefined if not found
   * - remove(arg, count) remove 'arg' in the list as well as the following 'count' items
   *
   * @private
   */
  args: function() {
    var list = [];
    var argfunc = function() {
      if (arguments.length === 1 && Array.isArray(arguments[0])) {
        list = list.concat(arguments[0]);
      } else {
        list = list.concat([].slice.call(arguments));
      }
    };
    argfunc.clear = function() {
      list = [];
    };
    argfunc.get = function() {
      return list;
    };
    argfunc.find = function(arg, count) {
      var index = list.indexOf(arg);
      if (index !== -1) {
        return list.slice(index + 1, index + 1 + (count || 0));
      }
    };
    argfunc.remove = function(arg, count) {
      var index = list.indexOf(arg);
      if (index !== -1) {
        list.splice(index, (count || 0) + 1);
      }
    };
    argfunc.clone = function() {
      var cloned = utils$1.args();
      cloned(list);
      return cloned;
    };
    return argfunc;
  },
  /**
   * Generate filter strings
   *
   * @param {String[]|Object[]} filters filter specifications. When using objects,
   *   each must have the following properties:
   * @param {String} filters.filter filter name
   * @param {String|Array} [filters.inputs] (array of) input stream specifier(s) for the filter,
   *   defaults to ffmpeg automatically choosing the first unused matching streams
   * @param {String|Array} [filters.outputs] (array of) output stream specifier(s) for the filter,
   *   defaults to ffmpeg automatically assigning the output to the output file
   * @param {Object|String|Array} [filters.options] filter options, can be omitted to not set any options
   * @return String[]
   * @private
   */
  makeFilterStrings: function(filters) {
    return filters.map(function(filterSpec) {
      if (typeof filterSpec === "string") {
        return filterSpec;
      }
      var filterString = "";
      if (Array.isArray(filterSpec.inputs)) {
        filterString += filterSpec.inputs.map(function(streamSpec) {
          return streamSpec.replace(streamRegexp, "[$1]");
        }).join("");
      } else if (typeof filterSpec.inputs === "string") {
        filterString += filterSpec.inputs.replace(streamRegexp, "[$1]");
      }
      filterString += filterSpec.filter;
      if (filterSpec.options) {
        if (typeof filterSpec.options === "string" || typeof filterSpec.options === "number") {
          filterString += "=" + filterSpec.options;
        } else if (Array.isArray(filterSpec.options)) {
          filterString += "=" + filterSpec.options.map(function(option) {
            if (typeof option === "string" && option.match(filterEscapeRegexp)) {
              return "'" + option + "'";
            } else {
              return option;
            }
          }).join(":");
        } else if (Object.keys(filterSpec.options).length) {
          filterString += "=" + Object.keys(filterSpec.options).map(function(option) {
            var value = filterSpec.options[option];
            if (typeof value === "string" && value.match(filterEscapeRegexp)) {
              value = "'" + value + "'";
            }
            return option + "=" + value;
          }).join(":");
        }
      }
      if (Array.isArray(filterSpec.outputs)) {
        filterString += filterSpec.outputs.map(function(streamSpec) {
          return streamSpec.replace(streamRegexp, "[$1]");
        }).join("");
      } else if (typeof filterSpec.outputs === "string") {
        filterString += filterSpec.outputs.replace(streamRegexp, "[$1]");
      }
      return filterString;
    });
  },
  /**
   * Search for an executable
   *
   * Uses 'which' or 'where' depending on platform
   *
   * @param {String} name executable name
   * @param {Function} callback callback with signature (err, path)
   * @private
   */
  which: function(name, callback) {
    if (name in whichCache) {
      return callback(null, whichCache[name]);
    }
    which(name, function(err, result) {
      if (err) {
        return callback(null, whichCache[name] = "");
      }
      callback(null, whichCache[name] = result);
    });
  },
  /**
   * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
   *
   * @param {String} timemark timemark string
   * @return Number
   * @private
   */
  timemarkToSeconds: function(timemark) {
    if (typeof timemark === "number") {
      return timemark;
    }
    if (timemark.indexOf(":") === -1 && timemark.indexOf(".") >= 0) {
      return Number(timemark);
    }
    var parts = timemark.split(":");
    var secs = Number(parts.pop());
    if (parts.length) {
      secs += Number(parts.pop()) * 60;
    }
    if (parts.length) {
      secs += Number(parts.pop()) * 3600;
    }
    return secs;
  },
  /**
   * Extract codec data from ffmpeg stderr and emit 'codecData' event if appropriate
   * Call it with an initially empty codec object once with each line of stderr output until it returns true
   *
   * @param {FfmpegCommand} command event emitter
   * @param {String} stderrLine ffmpeg stderr output line
   * @param {Object} codecObject object used to accumulate codec data between calls
   * @return {Boolean} true if codec data is complete (and event was emitted), false otherwise
   * @private
   */
  extractCodecData: function(command2, stderrLine, codecsObject) {
    var inputPattern = /Input #[0-9]+, ([^ ]+),/;
    var durPattern = /Duration\: ([^,]+)/;
    var audioPattern = /Audio\: (.*)/;
    var videoPattern = /Video\: (.*)/;
    if (!("inputStack" in codecsObject)) {
      codecsObject.inputStack = [];
      codecsObject.inputIndex = -1;
      codecsObject.inInput = false;
    }
    var inputStack = codecsObject.inputStack;
    var inputIndex = codecsObject.inputIndex;
    var inInput = codecsObject.inInput;
    var format2, dur, audio2, video2;
    if (format2 = stderrLine.match(inputPattern)) {
      inInput = codecsObject.inInput = true;
      inputIndex = codecsObject.inputIndex = codecsObject.inputIndex + 1;
      inputStack[inputIndex] = { format: format2[1], audio: "", video: "", duration: "" };
    } else if (inInput && (dur = stderrLine.match(durPattern))) {
      inputStack[inputIndex].duration = dur[1];
    } else if (inInput && (audio2 = stderrLine.match(audioPattern))) {
      audio2 = audio2[1].split(", ");
      inputStack[inputIndex].audio = audio2[0];
      inputStack[inputIndex].audio_details = audio2;
    } else if (inInput && (video2 = stderrLine.match(videoPattern))) {
      video2 = video2[1].split(", ");
      inputStack[inputIndex].video = video2[0];
      inputStack[inputIndex].video_details = video2;
    } else if (/Output #\d+/.test(stderrLine)) {
      inInput = codecsObject.inInput = false;
    } else if (/Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(stderrLine)) {
      command2.emit.apply(command2, ["codecData"].concat(inputStack));
      return true;
    }
    return false;
  },
  /**
   * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
   *
   * @param {FfmpegCommand} command event emitter
   * @param {String} stderrLine ffmpeg stderr data
   * @private
   */
  extractProgress: function(command2, stderrLine) {
    var progress = parseProgressLine(stderrLine);
    if (progress) {
      var ret = {
        frames: parseInt(progress.frame, 10),
        currentFps: parseInt(progress.fps, 10),
        currentKbps: progress.bitrate ? parseFloat(progress.bitrate.replace("kbits/s", "")) : 0,
        targetSize: parseInt(progress.size || progress.Lsize, 10),
        timemark: progress.time
      };
      if (command2._ffprobeData && command2._ffprobeData.format && command2._ffprobeData.format.duration) {
        var duration = Number(command2._ffprobeData.format.duration);
        if (!isNaN(duration))
          ret.percent = utils$1.timemarkToSeconds(ret.timemark) / duration * 100;
      }
      command2.emit("progress", ret);
    }
  },
  /**
   * Extract error message(s) from ffmpeg stderr
   *
   * @param {String} stderr ffmpeg stderr data
   * @return {String}
   * @private
   */
  extractError: function(stderr) {
    return stderr.split(nlRegexp).reduce(function(messages, message) {
      if (message.charAt(0) === " " || message.charAt(0) === "[") {
        return [];
      } else {
        messages.push(message);
        return messages;
      }
    }, []).join("\n");
  },
  /**
   * Creates a line ring buffer object with the following methods:
   * - append(str) : appends a string or buffer
   * - get() : returns the whole string
   * - close() : prevents further append() calls and does a last call to callbacks
   * - callback(cb) : calls cb for each line (incl. those already in the ring)
   *
   * @param {Number} maxLines maximum number of lines to store (<= 0 for unlimited)
   */
  linesRing: function(maxLines) {
    var cbs = [];
    var lines = [];
    var current = null;
    var closed = false;
    var max = maxLines - 1;
    function emit(line) {
      cbs.forEach(function(cb) {
        cb(line);
      });
    }
    return {
      callback: function(cb) {
        lines.forEach(function(l) {
          cb(l);
        });
        cbs.push(cb);
      },
      append: function(str) {
        if (closed) return;
        if (str instanceof Buffer) str = "" + str;
        if (!str || str.length === 0) return;
        var newLines = str.split(nlRegexp);
        if (newLines.length === 1) {
          if (current !== null) {
            current = current + newLines.shift();
          } else {
            current = newLines.shift();
          }
        } else {
          if (current !== null) {
            current = current + newLines.shift();
            emit(current);
            lines.push(current);
          }
          current = newLines.pop();
          newLines.forEach(function(l) {
            emit(l);
            lines.push(l);
          });
          if (max > -1 && lines.length > max) {
            lines.splice(0, lines.length - max);
          }
        }
      },
      get: function() {
        if (current !== null) {
          return lines.concat([current]).join("\n");
        } else {
          return lines.join("\n");
        }
      },
      close: function() {
        if (closed) return;
        if (current !== null) {
          emit(current);
          lines.push(current);
          if (max > -1 && lines.length > max) {
            lines.shift();
          }
          current = null;
        }
        closed = true;
      }
    };
  }
};
var utilsExports = utils$2.exports;
var inputs;
var hasRequiredInputs;
function requireInputs() {
  if (hasRequiredInputs) return inputs;
  hasRequiredInputs = 1;
  var utils2 = utilsExports;
  inputs = function(proto) {
    proto.mergeAdd = proto.addInput = proto.input = function(source) {
      var isFile = false;
      var isStream = false;
      if (typeof source !== "string") {
        if (!("readable" in source) || !source.readable) {
          throw new Error("Invalid input");
        }
        var hasInputStream = this._inputs.some(function(input2) {
          return input2.isStream;
        });
        if (hasInputStream) {
          throw new Error("Only one input stream is supported");
        }
        isStream = true;
        source.pause();
      } else {
        var protocol = source.match(/^([a-z]{2,}):/i);
        isFile = !protocol || protocol[0] === "file";
      }
      this._inputs.push(this._currentInput = {
        source,
        isFile,
        isStream,
        options: utils2.args()
      });
      return this;
    };
    proto.withInputFormat = proto.inputFormat = proto.fromFormat = function(format2) {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      this._currentInput.options("-f", format2);
      return this;
    };
    proto.withInputFps = proto.withInputFPS = proto.withFpsInput = proto.withFPSInput = proto.inputFPS = proto.inputFps = proto.fpsInput = proto.FPSInput = function(fps) {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      this._currentInput.options("-r", fps);
      return this;
    };
    proto.nativeFramerate = proto.withNativeFramerate = proto.native = function() {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      this._currentInput.options("-re");
      return this;
    };
    proto.setStartTime = proto.seekInput = function(seek) {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      this._currentInput.options("-ss", seek);
      return this;
    };
    proto.loop = function(duration) {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      this._currentInput.options("-loop", "1");
      if (typeof duration !== "undefined") {
        this.duration(duration);
      }
      return this;
    };
  };
  return inputs;
}
var audio;
var hasRequiredAudio;
function requireAudio() {
  if (hasRequiredAudio) return audio;
  hasRequiredAudio = 1;
  var utils2 = utilsExports;
  audio = function(proto) {
    proto.withNoAudio = proto.noAudio = function() {
      this._currentOutput.audio.clear();
      this._currentOutput.audioFilters.clear();
      this._currentOutput.audio("-an");
      return this;
    };
    proto.withAudioCodec = proto.audioCodec = function(codec) {
      this._currentOutput.audio("-acodec", codec);
      return this;
    };
    proto.withAudioBitrate = proto.audioBitrate = function(bitrate) {
      this._currentOutput.audio("-b:a", ("" + bitrate).replace(/k?$/, "k"));
      return this;
    };
    proto.withAudioChannels = proto.audioChannels = function(channels) {
      this._currentOutput.audio("-ac", channels);
      return this;
    };
    proto.withAudioFrequency = proto.audioFrequency = function(freq) {
      this._currentOutput.audio("-ar", freq);
      return this;
    };
    proto.withAudioQuality = proto.audioQuality = function(quality) {
      this._currentOutput.audio("-aq", quality);
      return this;
    };
    proto.withAudioFilter = proto.withAudioFilters = proto.audioFilter = proto.audioFilters = function(filters) {
      if (arguments.length > 1) {
        filters = [].slice.call(arguments);
      }
      if (!Array.isArray(filters)) {
        filters = [filters];
      }
      this._currentOutput.audioFilters(utils2.makeFilterStrings(filters));
      return this;
    };
  };
  return audio;
}
var video;
var hasRequiredVideo;
function requireVideo() {
  if (hasRequiredVideo) return video;
  hasRequiredVideo = 1;
  var utils2 = utilsExports;
  video = function(proto) {
    proto.withNoVideo = proto.noVideo = function() {
      this._currentOutput.video.clear();
      this._currentOutput.videoFilters.clear();
      this._currentOutput.video("-vn");
      return this;
    };
    proto.withVideoCodec = proto.videoCodec = function(codec) {
      this._currentOutput.video("-vcodec", codec);
      return this;
    };
    proto.withVideoBitrate = proto.videoBitrate = function(bitrate, constant) {
      bitrate = ("" + bitrate).replace(/k?$/, "k");
      this._currentOutput.video("-b:v", bitrate);
      if (constant) {
        this._currentOutput.video(
          "-maxrate",
          bitrate,
          "-minrate",
          bitrate,
          "-bufsize",
          "3M"
        );
      }
      return this;
    };
    proto.withVideoFilter = proto.withVideoFilters = proto.videoFilter = proto.videoFilters = function(filters) {
      if (arguments.length > 1) {
        filters = [].slice.call(arguments);
      }
      if (!Array.isArray(filters)) {
        filters = [filters];
      }
      this._currentOutput.videoFilters(utils2.makeFilterStrings(filters));
      return this;
    };
    proto.withOutputFps = proto.withOutputFPS = proto.withFpsOutput = proto.withFPSOutput = proto.withFps = proto.withFPS = proto.outputFPS = proto.outputFps = proto.fpsOutput = proto.FPSOutput = proto.fps = proto.FPS = function(fps) {
      this._currentOutput.video("-r", fps);
      return this;
    };
    proto.takeFrames = proto.withFrames = proto.frames = function(frames) {
      this._currentOutput.video("-vframes", frames);
      return this;
    };
  };
  return video;
}
var videosize;
var hasRequiredVideosize;
function requireVideosize() {
  if (hasRequiredVideosize) return videosize;
  hasRequiredVideosize = 1;
  function getScalePadFilters(width, height, aspect, color2) {
    return [
      /*
        In both cases, we first have to scale the input to match the requested size.
        When using computed width/height, we truncate them to multiples of 2
       */
      {
        filter: "scale",
        options: {
          w: "if(gt(a," + aspect + ")," + width + ",trunc(" + height + "*a/2)*2)",
          h: "if(lt(a," + aspect + ")," + height + ",trunc(" + width + "/a/2)*2)"
        }
      },
      /*
        Then we pad the scaled input to match the target size
        (here iw and ih refer to the padding input, i.e the scaled output)
       */
      {
        filter: "pad",
        options: {
          w: width,
          h: height,
          x: "if(gt(a," + aspect + "),0,(" + width + "-iw)/2)",
          y: "if(lt(a," + aspect + "),0,(" + height + "-ih)/2)",
          color: color2
        }
      }
    ];
  }
  function createSizeFilters(output2, key, value) {
    var data = output2.sizeData = output2.sizeData || {};
    data[key] = value;
    if (!("size" in data)) {
      return [];
    }
    var fixedSize = data.size.match(/([0-9]+)x([0-9]+)/);
    var fixedWidth = data.size.match(/([0-9]+)x\?/);
    var fixedHeight = data.size.match(/\?x([0-9]+)/);
    var percentRatio = data.size.match(/\b([0-9]{1,3})%/);
    var width, height, aspect;
    if (percentRatio) {
      var ratio = Number(percentRatio[1]) / 100;
      return [{
        filter: "scale",
        options: {
          w: "trunc(iw*" + ratio + "/2)*2",
          h: "trunc(ih*" + ratio + "/2)*2"
        }
      }];
    } else if (fixedSize) {
      width = Math.round(Number(fixedSize[1]) / 2) * 2;
      height = Math.round(Number(fixedSize[2]) / 2) * 2;
      aspect = width / height;
      if (data.pad) {
        return getScalePadFilters(width, height, aspect, data.pad);
      } else {
        return [{ filter: "scale", options: { w: width, h: height } }];
      }
    } else if (fixedWidth || fixedHeight) {
      if ("aspect" in data) {
        width = fixedWidth ? fixedWidth[1] : Math.round(Number(fixedHeight[1]) * data.aspect);
        height = fixedHeight ? fixedHeight[1] : Math.round(Number(fixedWidth[1]) / data.aspect);
        width = Math.round(width / 2) * 2;
        height = Math.round(height / 2) * 2;
        if (data.pad) {
          return getScalePadFilters(width, height, data.aspect, data.pad);
        } else {
          return [{ filter: "scale", options: { w: width, h: height } }];
        }
      } else {
        if (fixedWidth) {
          return [{
            filter: "scale",
            options: {
              w: Math.round(Number(fixedWidth[1]) / 2) * 2,
              h: "trunc(ow/a/2)*2"
            }
          }];
        } else {
          return [{
            filter: "scale",
            options: {
              w: "trunc(oh*a/2)*2",
              h: Math.round(Number(fixedHeight[1]) / 2) * 2
            }
          }];
        }
      }
    } else {
      throw new Error("Invalid size specified: " + data.size);
    }
  }
  videosize = function(proto) {
    proto.keepPixelAspect = // Only for compatibility, this is not about keeping _pixel_ aspect ratio
    proto.keepDisplayAspect = proto.keepDisplayAspectRatio = proto.keepDAR = function() {
      return this.videoFilters([
        {
          filter: "scale",
          options: {
            w: "if(gt(sar,1),iw*sar,iw)",
            h: "if(lt(sar,1),ih/sar,ih)"
          }
        },
        {
          filter: "setsar",
          options: "1"
        }
      ]);
    };
    proto.withSize = proto.setSize = proto.size = function(size) {
      var filters = createSizeFilters(this._currentOutput, "size", size);
      this._currentOutput.sizeFilters.clear();
      this._currentOutput.sizeFilters(filters);
      return this;
    };
    proto.withAspect = proto.withAspectRatio = proto.setAspect = proto.setAspectRatio = proto.aspect = proto.aspectRatio = function(aspect) {
      var a = Number(aspect);
      if (isNaN(a)) {
        var match = aspect.match(/^(\d+):(\d+)$/);
        if (match) {
          a = Number(match[1]) / Number(match[2]);
        } else {
          throw new Error("Invalid aspect ratio: " + aspect);
        }
      }
      var filters = createSizeFilters(this._currentOutput, "aspect", a);
      this._currentOutput.sizeFilters.clear();
      this._currentOutput.sizeFilters(filters);
      return this;
    };
    proto.applyAutopadding = proto.applyAutoPadding = proto.applyAutopad = proto.applyAutoPad = proto.withAutopadding = proto.withAutoPadding = proto.withAutopad = proto.withAutoPad = proto.autoPad = proto.autopad = function(pad, color2) {
      if (typeof pad === "string") {
        color2 = pad;
        pad = true;
      }
      if (typeof pad === "undefined") {
        pad = true;
      }
      var filters = createSizeFilters(this._currentOutput, "pad", pad ? color2 || "black" : false);
      this._currentOutput.sizeFilters.clear();
      this._currentOutput.sizeFilters(filters);
      return this;
    };
  };
  return videosize;
}
var output$1;
var hasRequiredOutput;
function requireOutput() {
  if (hasRequiredOutput) return output$1;
  hasRequiredOutput = 1;
  var utils2 = utilsExports;
  output$1 = function(proto) {
    proto.addOutput = proto.output = function(target, pipeopts) {
      var isFile = false;
      if (!target && this._currentOutput) {
        throw new Error("Invalid output");
      }
      if (target && typeof target !== "string") {
        if (!("writable" in target) || !target.writable) {
          throw new Error("Invalid output");
        }
      } else if (typeof target === "string") {
        var protocol = target.match(/^([a-z]{2,}):/i);
        isFile = !protocol || protocol[0] === "file";
      }
      if (target && !("target" in this._currentOutput)) {
        this._currentOutput.target = target;
        this._currentOutput.isFile = isFile;
        this._currentOutput.pipeopts = pipeopts || {};
      } else {
        if (target && typeof target !== "string") {
          var hasOutputStream = this._outputs.some(function(output2) {
            return typeof output2.target !== "string";
          });
          if (hasOutputStream) {
            throw new Error("Only one output stream is supported");
          }
        }
        this._outputs.push(this._currentOutput = {
          target,
          isFile,
          flags: {},
          pipeopts: pipeopts || {}
        });
        var self = this;
        ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(key) {
          self._currentOutput[key] = utils2.args();
        });
        if (!target) {
          delete this._currentOutput.target;
        }
      }
      return this;
    };
    proto.seekOutput = proto.seek = function(seek) {
      this._currentOutput.options("-ss", seek);
      return this;
    };
    proto.withDuration = proto.setDuration = proto.duration = function(duration) {
      this._currentOutput.options("-t", duration);
      return this;
    };
    proto.toFormat = proto.withOutputFormat = proto.outputFormat = proto.format = function(format2) {
      this._currentOutput.options("-f", format2);
      return this;
    };
    proto.map = function(spec) {
      this._currentOutput.options("-map", spec.replace(utils2.streamRegexp, "[$1]"));
      return this;
    };
    proto.updateFlvMetadata = proto.flvmeta = function() {
      this._currentOutput.flags.flvmeta = true;
      return this;
    };
  };
  return output$1;
}
var custom;
var hasRequiredCustom;
function requireCustom() {
  if (hasRequiredCustom) return custom;
  hasRequiredCustom = 1;
  var utils2 = utilsExports;
  custom = function(proto) {
    proto.addInputOption = proto.addInputOptions = proto.withInputOption = proto.withInputOptions = proto.inputOption = proto.inputOptions = function(options) {
      if (!this._currentInput) {
        throw new Error("No input specified");
      }
      var doSplit = true;
      if (arguments.length > 1) {
        options = [].slice.call(arguments);
        doSplit = false;
      }
      if (!Array.isArray(options)) {
        options = [options];
      }
      this._currentInput.options(options.reduce(function(options2, option) {
        var split = String(option).split(" ");
        if (doSplit && split.length === 2) {
          options2.push(split[0], split[1]);
        } else {
          options2.push(option);
        }
        return options2;
      }, []));
      return this;
    };
    proto.addOutputOption = proto.addOutputOptions = proto.addOption = proto.addOptions = proto.withOutputOption = proto.withOutputOptions = proto.withOption = proto.withOptions = proto.outputOption = proto.outputOptions = function(options) {
      var doSplit = true;
      if (arguments.length > 1) {
        options = [].slice.call(arguments);
        doSplit = false;
      }
      if (!Array.isArray(options)) {
        options = [options];
      }
      this._currentOutput.options(options.reduce(function(options2, option) {
        var split = String(option).split(" ");
        if (doSplit && split.length === 2) {
          options2.push(split[0], split[1]);
        } else {
          options2.push(option);
        }
        return options2;
      }, []));
      return this;
    };
    proto.filterGraph = proto.complexFilter = function(spec, map) {
      this._complexFilters.clear();
      if (!Array.isArray(spec)) {
        spec = [spec];
      }
      this._complexFilters("-filter_complex", utils2.makeFilterStrings(spec).join(";"));
      if (Array.isArray(map)) {
        var self = this;
        map.forEach(function(streamSpec) {
          self._complexFilters("-map", streamSpec.replace(utils2.streamRegexp, "[$1]"));
        });
      } else if (typeof map === "string") {
        this._complexFilters("-map", map.replace(utils2.streamRegexp, "[$1]"));
      }
      return this;
    };
  };
  return custom;
}
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var misc;
var hasRequiredMisc;
function requireMisc() {
  if (hasRequiredMisc) return misc;
  hasRequiredMisc = 1;
  var path2 = require$$1;
  misc = function(proto) {
    proto.usingPreset = proto.preset = function(preset) {
      if (typeof preset === "function") {
        preset(this);
      } else {
        try {
          var modulePath = path2.join(this.options.presets, preset);
          var module2 = commonjsRequire(modulePath);
          if (typeof module2.load === "function") {
            module2.load(this);
          } else {
            throw new Error("preset " + modulePath + " has no load() function");
          }
        } catch (err) {
          throw new Error("preset " + modulePath + " could not be loaded: " + err.message);
        }
      }
      return this;
    };
  };
  return misc;
}
var async = { exports: {} };
var hasRequiredAsync;
function requireAsync() {
  if (hasRequiredAsync) return async.exports;
  hasRequiredAsync = 1;
  (function(module2) {
    (function() {
      var async2 = {};
      var root, previous_async;
      root = this;
      if (root != null) {
        previous_async = root.async;
      }
      async2.noConflict = function() {
        root.async = previous_async;
        return async2;
      };
      function only_once(fn2) {
        var called = false;
        return function() {
          if (called) throw new Error("Callback was already called.");
          called = true;
          fn2.apply(root, arguments);
        };
      }
      var _each = function(arr, iterator) {
        if (arr.forEach) {
          return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
          iterator(arr[i], i, arr);
        }
      };
      var _map = function(arr, iterator) {
        if (arr.map) {
          return arr.map(iterator);
        }
        var results = [];
        _each(arr, function(x, i, a) {
          results.push(iterator(x, i, a));
        });
        return results;
      };
      var _reduce = function(arr, iterator, memo) {
        if (arr.reduce) {
          return arr.reduce(iterator, memo);
        }
        _each(arr, function(x, i, a) {
          memo = iterator(memo, x, i, a);
        });
        return memo;
      };
      var _keys = function(obj) {
        if (Object.keys) {
          return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
          if (obj.hasOwnProperty(k)) {
            keys.push(k);
          }
        }
        return keys;
      };
      if (typeof process === "undefined" || !process.nextTick) {
        if (typeof setImmediate === "function") {
          async2.nextTick = function(fn2) {
            setImmediate(fn2);
          };
          async2.setImmediate = async2.nextTick;
        } else {
          async2.nextTick = function(fn2) {
            setTimeout(fn2, 0);
          };
          async2.setImmediate = async2.nextTick;
        }
      } else {
        async2.nextTick = process.nextTick;
        if (typeof setImmediate !== "undefined") {
          async2.setImmediate = function(fn2) {
            setImmediate(fn2);
          };
        } else {
          async2.setImmediate = async2.nextTick;
        }
      }
      async2.each = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        _each(arr, function(x) {
          iterator(x, only_once(function(err) {
            if (err) {
              callback(err);
              callback = function() {
              };
            } else {
              completed += 1;
              if (completed >= arr.length) {
                callback(null);
              }
            }
          }));
        });
      };
      async2.forEach = async2.each;
      async2.eachSeries = function(arr, iterator, callback) {
        callback = callback || function() {
        };
        if (!arr.length) {
          return callback();
        }
        var completed = 0;
        var iterate = function() {
          iterator(arr[completed], function(err) {
            if (err) {
              callback(err);
              callback = function() {
              };
            } else {
              completed += 1;
              if (completed >= arr.length) {
                callback(null);
              } else {
                iterate();
              }
            }
          });
        };
        iterate();
      };
      async2.forEachSeries = async2.eachSeries;
      async2.eachLimit = function(arr, limit, iterator, callback) {
        var fn2 = _eachLimit(limit);
        fn2.apply(null, [arr, iterator, callback]);
      };
      async2.forEachLimit = async2.eachLimit;
      var _eachLimit = function(limit) {
        return function(arr, iterator, callback) {
          callback = callback || function() {
          };
          if (!arr.length || limit <= 0) {
            return callback();
          }
          var completed = 0;
          var started = 0;
          var running = 0;
          (function replenish() {
            if (completed >= arr.length) {
              return callback();
            }
            while (running < limit && started < arr.length) {
              started += 1;
              running += 1;
              iterator(arr[started - 1], function(err) {
                if (err) {
                  callback(err);
                  callback = function() {
                  };
                } else {
                  completed += 1;
                  running -= 1;
                  if (completed >= arr.length) {
                    callback();
                  } else {
                    replenish();
                  }
                }
              });
            }
          })();
        };
      };
      var doParallel = function(fn2) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn2.apply(null, [async2.each].concat(args));
        };
      };
      var doParallelLimit = function(limit, fn2) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn2.apply(null, [_eachLimit(limit)].concat(args));
        };
      };
      var doSeries = function(fn2) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          return fn2.apply(null, [async2.eachSeries].concat(args));
        };
      };
      var _asyncMap = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(err, v) {
            results[x.index] = v;
            callback2(err);
          });
        }, function(err) {
          callback(err, results);
        });
      };
      async2.map = doParallel(_asyncMap);
      async2.mapSeries = doSeries(_asyncMap);
      async2.mapLimit = function(arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
      };
      var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
      };
      async2.reduce = function(arr, memo, iterator, callback) {
        async2.eachSeries(arr, function(x, callback2) {
          iterator(memo, x, function(err, v) {
            memo = v;
            callback2(err);
          });
        }, function(err) {
          callback(err, memo);
        });
      };
      async2.inject = async2.reduce;
      async2.foldl = async2.reduce;
      async2.reduceRight = function(arr, memo, iterator, callback) {
        var reversed = _map(arr, function(x) {
          return x;
        }).reverse();
        async2.reduce(reversed, memo, iterator, callback);
      };
      async2.foldr = async2.reduceRight;
      var _filter = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      };
      async2.filter = doParallel(_filter);
      async2.filterSeries = doSeries(_filter);
      async2.select = async2.filter;
      async2.selectSeries = async2.filterSeries;
      var _reject = function(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function(x, i) {
          return { index: i, value: x };
        });
        eachfn(arr, function(x, callback2) {
          iterator(x.value, function(v) {
            if (!v) {
              results.push(x);
            }
            callback2();
          });
        }, function(err) {
          callback(_map(results.sort(function(a, b) {
            return a.index - b.index;
          }), function(x) {
            return x.value;
          }));
        });
      };
      async2.reject = doParallel(_reject);
      async2.rejectSeries = doSeries(_reject);
      var _detect = function(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function(x, callback) {
          iterator(x, function(result) {
            if (result) {
              main_callback(x);
              main_callback = function() {
              };
            } else {
              callback();
            }
          });
        }, function(err) {
          main_callback();
        });
      };
      async2.detect = doParallel(_detect);
      async2.detectSeries = doSeries(_detect);
      async2.some = function(arr, iterator, main_callback) {
        async2.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (v) {
              main_callback(true);
              main_callback = function() {
              };
            }
            callback();
          });
        }, function(err) {
          main_callback(false);
        });
      };
      async2.any = async2.some;
      async2.every = function(arr, iterator, main_callback) {
        async2.each(arr, function(x, callback) {
          iterator(x, function(v) {
            if (!v) {
              main_callback(false);
              main_callback = function() {
              };
            }
            callback();
          });
        }, function(err) {
          main_callback(true);
        });
      };
      async2.all = async2.every;
      async2.sortBy = function(arr, iterator, callback) {
        async2.map(arr, function(x, callback2) {
          iterator(x, function(err, criteria) {
            if (err) {
              callback2(err);
            } else {
              callback2(null, { value: x, criteria });
            }
          });
        }, function(err, results) {
          if (err) {
            return callback(err);
          } else {
            var fn2 = function(left, right) {
              var a = left.criteria, b = right.criteria;
              return a < b ? -1 : a > b ? 1 : 0;
            };
            callback(null, _map(results.sort(fn2), function(x) {
              return x.value;
            }));
          }
        });
      };
      async2.auto = function(tasks, callback) {
        callback = callback || function() {
        };
        var keys = _keys(tasks);
        if (!keys.length) {
          return callback(null);
        }
        var results = {};
        var listeners = [];
        var addListener = function(fn2) {
          listeners.unshift(fn2);
        };
        var removeListener = function(fn2) {
          for (var i = 0; i < listeners.length; i += 1) {
            if (listeners[i] === fn2) {
              listeners.splice(i, 1);
              return;
            }
          }
        };
        var taskComplete = function() {
          _each(listeners.slice(0), function(fn2) {
            fn2();
          });
        };
        addListener(function() {
          if (_keys(results).length === keys.length) {
            callback(null, results);
            callback = function() {
            };
          }
        });
        _each(keys, function(k) {
          var task = tasks[k] instanceof Function ? [tasks[k]] : tasks[k];
          var taskCallback = function(err) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (args.length <= 1) {
              args = args[0];
            }
            if (err) {
              var safeResults = {};
              _each(_keys(results), function(rkey) {
                safeResults[rkey] = results[rkey];
              });
              safeResults[k] = args;
              callback(err, safeResults);
              callback = function() {
              };
            } else {
              results[k] = args;
              async2.setImmediate(taskComplete);
            }
          };
          var requires = task.slice(0, Math.abs(task.length - 1)) || [];
          var ready = function() {
            return _reduce(requires, function(a, x) {
              return a && results.hasOwnProperty(x);
            }, true) && !results.hasOwnProperty(k);
          };
          if (ready()) {
            task[task.length - 1](taskCallback, results);
          } else {
            var listener = function() {
              if (ready()) {
                removeListener(listener);
                task[task.length - 1](taskCallback, results);
              }
            };
            addListener(listener);
          }
        });
      };
      async2.waterfall = function(tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor !== Array) {
          var err = new Error("First argument to waterfall must be an array of functions");
          return callback(err);
        }
        if (!tasks.length) {
          return callback();
        }
        var wrapIterator = function(iterator) {
          return function(err2) {
            if (err2) {
              callback.apply(null, arguments);
              callback = function() {
              };
            } else {
              var args = Array.prototype.slice.call(arguments, 1);
              var next = iterator.next();
              if (next) {
                args.push(wrapIterator(next));
              } else {
                args.push(callback);
              }
              async2.setImmediate(function() {
                iterator.apply(null, args);
              });
            }
          };
        };
        wrapIterator(async2.iterator(tasks))();
      };
      var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor === Array) {
          eachfn.map(tasks, function(fn2, callback2) {
            if (fn2) {
              fn2(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          eachfn.each(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async2.parallel = function(tasks, callback) {
        _parallel({ map: async2.map, each: async2.each }, tasks, callback);
      };
      async2.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
      };
      async2.series = function(tasks, callback) {
        callback = callback || function() {
        };
        if (tasks.constructor === Array) {
          async2.mapSeries(tasks, function(fn2, callback2) {
            if (fn2) {
              fn2(function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                  args = args[0];
                }
                callback2.call(null, err, args);
              });
            }
          }, callback);
        } else {
          var results = {};
          async2.eachSeries(_keys(tasks), function(k, callback2) {
            tasks[k](function(err) {
              var args = Array.prototype.slice.call(arguments, 1);
              if (args.length <= 1) {
                args = args[0];
              }
              results[k] = args;
              callback2(err);
            });
          }, function(err) {
            callback(err, results);
          });
        }
      };
      async2.iterator = function(tasks) {
        var makeCallback = function(index) {
          var fn2 = function() {
            if (tasks.length) {
              tasks[index].apply(null, arguments);
            }
            return fn2.next();
          };
          fn2.next = function() {
            return index < tasks.length - 1 ? makeCallback(index + 1) : null;
          };
          return fn2;
        };
        return makeCallback(0);
      };
      async2.apply = function(fn2) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
          return fn2.apply(
            null,
            args.concat(Array.prototype.slice.call(arguments))
          );
        };
      };
      var _concat = function(eachfn, arr, fn2, callback) {
        var r = [];
        eachfn(arr, function(x, cb) {
          fn2(x, function(err, y) {
            r = r.concat(y || []);
            cb(err);
          });
        }, function(err) {
          callback(err, r);
        });
      };
      async2.concat = doParallel(_concat);
      async2.concatSeries = doSeries(_concat);
      async2.whilst = function(test, iterator, callback) {
        if (test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async2.whilst(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async2.doWhilst = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          if (test()) {
            async2.doWhilst(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async2.until = function(test, iterator, callback) {
        if (!test()) {
          iterator(function(err) {
            if (err) {
              return callback(err);
            }
            async2.until(test, iterator, callback);
          });
        } else {
          callback();
        }
      };
      async2.doUntil = function(iterator, test, callback) {
        iterator(function(err) {
          if (err) {
            return callback(err);
          }
          if (!test()) {
            async2.doUntil(iterator, test, callback);
          } else {
            callback();
          }
        });
      };
      async2.queue = function(worker, concurrency2) {
        if (concurrency2 === void 0) {
          concurrency2 = 1;
        }
        function _insert(q2, data, pos, callback) {
          if (data.constructor !== Array) {
            data = [data];
          }
          _each(data, function(task) {
            var item = {
              data: task,
              callback: typeof callback === "function" ? callback : null
            };
            if (pos) {
              q2.tasks.unshift(item);
            } else {
              q2.tasks.push(item);
            }
            if (q2.saturated && q2.tasks.length === concurrency2) {
              q2.saturated();
            }
            async2.setImmediate(q2.process);
          });
        }
        var workers = 0;
        var q = {
          tasks: [],
          concurrency: concurrency2,
          saturated: null,
          empty: null,
          drain: null,
          push: function(data, callback) {
            _insert(q, data, false, callback);
          },
          unshift: function(data, callback) {
            _insert(q, data, true, callback);
          },
          process: function() {
            if (workers < q.concurrency && q.tasks.length) {
              var task = q.tasks.shift();
              if (q.empty && q.tasks.length === 0) {
                q.empty();
              }
              workers += 1;
              var next = function() {
                workers -= 1;
                if (task.callback) {
                  task.callback.apply(task, arguments);
                }
                if (q.drain && q.tasks.length + workers === 0) {
                  q.drain();
                }
                q.process();
              };
              var cb = only_once(next);
              worker(task.data, cb);
            }
          },
          length: function() {
            return q.tasks.length;
          },
          running: function() {
            return workers;
          }
        };
        return q;
      };
      async2.cargo = function(worker, payload) {
        var working = false, tasks = [];
        var cargo = {
          tasks,
          payload,
          saturated: null,
          empty: null,
          drain: null,
          push: function(data, callback) {
            if (data.constructor !== Array) {
              data = [data];
            }
            _each(data, function(task) {
              tasks.push({
                data: task,
                callback: typeof callback === "function" ? callback : null
              });
              if (cargo.saturated && tasks.length === payload) {
                cargo.saturated();
              }
            });
            async2.setImmediate(cargo.process);
          },
          process: function process2() {
            if (working) return;
            if (tasks.length === 0) {
              if (cargo.drain) cargo.drain();
              return;
            }
            var ts = typeof payload === "number" ? tasks.splice(0, payload) : tasks.splice(0);
            var ds = _map(ts, function(task) {
              return task.data;
            });
            if (cargo.empty) cargo.empty();
            working = true;
            worker(ds, function() {
              working = false;
              var args = arguments;
              _each(ts, function(data) {
                if (data.callback) {
                  data.callback.apply(null, args);
                }
              });
              process2();
            });
          },
          length: function() {
            return tasks.length;
          },
          running: function() {
            return working;
          }
        };
        return cargo;
      };
      var _console_fn = function(name) {
        return function(fn2) {
          var args = Array.prototype.slice.call(arguments, 1);
          fn2.apply(null, args.concat([function(err) {
            var args2 = Array.prototype.slice.call(arguments, 1);
            if (typeof console !== "undefined") {
              if (err) {
                if (console.error) {
                  console.error(err);
                }
              } else if (console[name]) {
                _each(args2, function(x) {
                  console[name](x);
                });
              }
            }
          }]));
        };
      };
      async2.log = _console_fn("log");
      async2.dir = _console_fn("dir");
      async2.memoize = function(fn2, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function(x) {
          return x;
        };
        var memoized = function() {
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          var key = hasher.apply(null, args);
          if (key in memo) {
            callback.apply(null, memo[key]);
          } else if (key in queues) {
            queues[key].push(callback);
          } else {
            queues[key] = [callback];
            fn2.apply(null, args.concat([function() {
              memo[key] = arguments;
              var q = queues[key];
              delete queues[key];
              for (var i = 0, l = q.length; i < l; i++) {
                q[i].apply(null, arguments);
              }
            }]));
          }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn2;
        return memoized;
      };
      async2.unmemoize = function(fn2) {
        return function() {
          return (fn2.unmemoized || fn2).apply(null, arguments);
        };
      };
      async2.times = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async2.map(counter, iterator, callback);
      };
      async2.timesSeries = function(count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
          counter.push(i);
        }
        return async2.mapSeries(counter, iterator, callback);
      };
      async2.compose = function() {
        var fns = Array.prototype.reverse.call(arguments);
        return function() {
          var that = this;
          var args = Array.prototype.slice.call(arguments);
          var callback = args.pop();
          async2.reduce(
            fns,
            args,
            function(newargs, fn2, cb) {
              fn2.apply(that, newargs.concat([function() {
                var err = arguments[0];
                var nextargs = Array.prototype.slice.call(arguments, 1);
                cb(err, nextargs);
              }]));
            },
            function(err, results) {
              callback.apply(that, [err].concat(results));
            }
          );
        };
      };
      var _applyEach = function(eachfn, fns) {
        var go = function() {
          var that = this;
          var args2 = Array.prototype.slice.call(arguments);
          var callback = args2.pop();
          return eachfn(
            fns,
            function(fn2, cb) {
              fn2.apply(that, args2.concat([cb]));
            },
            callback
          );
        };
        if (arguments.length > 2) {
          var args = Array.prototype.slice.call(arguments, 2);
          return go.apply(this, args);
        } else {
          return go;
        }
      };
      async2.applyEach = doParallel(_applyEach);
      async2.applyEachSeries = doSeries(_applyEach);
      async2.forever = function(fn2, callback) {
        function next(err) {
          if (err) {
            if (callback) {
              return callback(err);
            }
            throw err;
          }
          fn2(next);
        }
        next();
      };
      if (module2.exports) {
        module2.exports = async2;
      } else {
        root.async = async2;
      }
    })();
  })(async);
  return async.exports;
}
var processor;
var hasRequiredProcessor;
function requireProcessor() {
  if (hasRequiredProcessor) return processor;
  hasRequiredProcessor = 1;
  var spawn = require$$0$1.spawn;
  var async2 = requireAsync();
  var utils2 = utilsExports;
  function runFfprobe(command2) {
    const inputProbeIndex = 0;
    if (command2._inputs[inputProbeIndex].isStream) {
      return;
    }
    command2.ffprobe(inputProbeIndex, function(err, data) {
      command2._ffprobeData = data;
    });
  }
  processor = function(proto) {
    proto._spawnFfmpeg = function(args, options, processCB, endCB) {
      if (typeof options === "function") {
        endCB = processCB;
        processCB = options;
        options = {};
      }
      if (typeof endCB === "undefined") {
        endCB = processCB;
        processCB = function() {
        };
      }
      var maxLines = "stdoutLines" in options ? options.stdoutLines : this.options.stdoutLines;
      this._getFfmpegPath(function(err, command2) {
        if (err) {
          return endCB(err);
        } else if (!command2 || command2.length === 0) {
          return endCB(new Error("Cannot find ffmpeg"));
        }
        if (options.niceness && options.niceness !== 0 && !utils2.isWindows) {
          args.unshift("-n", options.niceness, command2);
          command2 = "nice";
        }
        var stdoutRing = utils2.linesRing(maxLines);
        var stdoutClosed = false;
        var stderrRing = utils2.linesRing(maxLines);
        var stderrClosed = false;
        var ffmpegProc = spawn(command2, args, options);
        if (ffmpegProc.stderr) {
          ffmpegProc.stderr.setEncoding("utf8");
        }
        ffmpegProc.on("error", function(err2) {
          endCB(err2);
        });
        var exitError = null;
        function handleExit(err2) {
          if (err2) {
            exitError = err2;
          }
          if (processExited && (stdoutClosed || !options.captureStdout) && stderrClosed) {
            endCB(exitError, stdoutRing, stderrRing);
          }
        }
        var processExited = false;
        ffmpegProc.on("exit", function(code, signal) {
          processExited = true;
          if (signal) {
            handleExit(new Error("ffmpeg was killed with signal " + signal));
          } else if (code) {
            handleExit(new Error("ffmpeg exited with code " + code));
          } else {
            handleExit();
          }
        });
        if (options.captureStdout) {
          ffmpegProc.stdout.on("data", function(data) {
            stdoutRing.append(data);
          });
          ffmpegProc.stdout.on("close", function() {
            stdoutRing.close();
            stdoutClosed = true;
            handleExit();
          });
        }
        ffmpegProc.stderr.on("data", function(data) {
          stderrRing.append(data);
        });
        ffmpegProc.stderr.on("close", function() {
          stderrRing.close();
          stderrClosed = true;
          handleExit();
        });
        processCB(ffmpegProc, stdoutRing, stderrRing);
      });
    };
    proto._getArguments = function() {
      var complexFilters = this._complexFilters.get();
      var fileOutput = this._outputs.some(function(output2) {
        return output2.isFile;
      });
      return [].concat(
        // Inputs and input options
        this._inputs.reduce(function(args, input2) {
          var source = typeof input2.source === "string" ? input2.source : "pipe:0";
          return args.concat(
            input2.options.get(),
            ["-i", source]
          );
        }, []),
        // Global options
        this._global.get(),
        // Overwrite if we have file outputs
        fileOutput ? ["-y"] : [],
        // Complex filters
        complexFilters,
        // Outputs, filters and output options
        this._outputs.reduce(function(args, output2) {
          var sizeFilters = utils2.makeFilterStrings(output2.sizeFilters.get());
          var audioFilters = output2.audioFilters.get();
          var videoFilters = output2.videoFilters.get().concat(sizeFilters);
          var outputArg;
          if (!output2.target) {
            outputArg = [];
          } else if (typeof output2.target === "string") {
            outputArg = [output2.target];
          } else {
            outputArg = ["pipe:1"];
          }
          return args.concat(
            output2.audio.get(),
            audioFilters.length ? ["-filter:a", audioFilters.join(",")] : [],
            output2.video.get(),
            videoFilters.length ? ["-filter:v", videoFilters.join(",")] : [],
            output2.options.get(),
            outputArg
          );
        }, [])
      );
    };
    proto._prepare = function(callback, readMetadata) {
      var self = this;
      async2.waterfall([
        // Check codecs and formats
        function(cb) {
          self._checkCapabilities(cb);
        },
        // Read metadata if required
        function(cb) {
          if (!readMetadata) {
            return cb();
          }
          self.ffprobe(0, function(err, data) {
            if (!err) {
              self._ffprobeData = data;
            }
            cb();
          });
        },
        // Check for flvtool2/flvmeta if necessary
        function(cb) {
          var flvmeta = self._outputs.some(function(output2) {
            if (output2.flags.flvmeta && !output2.isFile) {
              self.logger.warn("Updating flv metadata is only supported for files");
              output2.flags.flvmeta = false;
            }
            return output2.flags.flvmeta;
          });
          if (flvmeta) {
            self._getFlvtoolPath(function(err) {
              cb(err);
            });
          } else {
            cb();
          }
        },
        // Build argument list
        function(cb) {
          var args;
          try {
            args = self._getArguments();
          } catch (e) {
            return cb(e);
          }
          cb(null, args);
        },
        // Add "-strict experimental" option where needed
        function(args, cb) {
          self.availableEncoders(function(err, encoders) {
            for (var i = 0; i < args.length; i++) {
              if (args[i] === "-acodec" || args[i] === "-vcodec") {
                i++;
                if (args[i] in encoders && encoders[args[i]].experimental) {
                  args.splice(i + 1, 0, "-strict", "experimental");
                  i += 2;
                }
              }
            }
            cb(null, args);
          });
        }
      ], callback);
      if (!readMetadata) {
        if (this.listeners("progress").length > 0) {
          runFfprobe(this);
        } else {
          this.once("newListener", function(event) {
            if (event === "progress") {
              runFfprobe(this);
            }
          });
        }
      }
    };
    proto.exec = proto.execute = proto.run = function() {
      var self = this;
      var outputPresent = this._outputs.some(function(output2) {
        return "target" in output2;
      });
      if (!outputPresent) {
        throw new Error("No output specified");
      }
      var outputStream = this._outputs.filter(function(output2) {
        return typeof output2.target !== "string";
      })[0];
      var inputStream = this._inputs.filter(function(input2) {
        return typeof input2.source !== "string";
      })[0];
      var ended = false;
      function emitEnd(err, stdout, stderr) {
        if (!ended) {
          ended = true;
          if (err) {
            self.emit("error", err, stdout, stderr);
          } else {
            self.emit("end", stdout, stderr);
          }
        }
      }
      self._prepare(function(err, args) {
        if (err) {
          return emitEnd(err);
        }
        self._spawnFfmpeg(
          args,
          {
            captureStdout: !outputStream,
            niceness: self.options.niceness,
            cwd: self.options.cwd,
            windowsHide: true
          },
          function processCB(ffmpegProc, stdoutRing, stderrRing) {
            self.ffmpegProc = ffmpegProc;
            self.emit("start", "ffmpeg " + args.join(" "));
            if (inputStream) {
              inputStream.source.on("error", function(err2) {
                var reportingErr = new Error("Input stream error: " + err2.message);
                reportingErr.inputStreamError = err2;
                emitEnd(reportingErr);
                ffmpegProc.kill();
              });
              inputStream.source.resume();
              inputStream.source.pipe(ffmpegProc.stdin);
              ffmpegProc.stdin.on("error", function() {
              });
            }
            if (self.options.timeout) {
              self.processTimer = setTimeout(function() {
                var msg = "process ran into a timeout (" + self.options.timeout + "s)";
                emitEnd(new Error(msg), stdoutRing.get(), stderrRing.get());
                ffmpegProc.kill();
              }, self.options.timeout * 1e3);
            }
            if (outputStream) {
              ffmpegProc.stdout.pipe(outputStream.target, outputStream.pipeopts);
              outputStream.target.on("close", function() {
                self.logger.debug("Output stream closed, scheduling kill for ffmpeg process");
                setTimeout(function() {
                  emitEnd(new Error("Output stream closed"));
                  ffmpegProc.kill();
                }, 20);
              });
              outputStream.target.on("error", function(err2) {
                self.logger.debug("Output stream error, killing ffmpeg process");
                var reportingErr = new Error("Output stream error: " + err2.message);
                reportingErr.outputStreamError = err2;
                emitEnd(reportingErr, stdoutRing.get(), stderrRing.get());
                ffmpegProc.kill("SIGKILL");
              });
            }
            if (stderrRing) {
              if (self.listeners("stderr").length) {
                stderrRing.callback(function(line) {
                  self.emit("stderr", line);
                });
              }
              if (self.listeners("codecData").length) {
                var codecDataSent = false;
                var codecObject = {};
                stderrRing.callback(function(line) {
                  if (!codecDataSent)
                    codecDataSent = utils2.extractCodecData(self, line, codecObject);
                });
              }
              if (self.listeners("progress").length) {
                stderrRing.callback(function(line) {
                  utils2.extractProgress(self, line);
                });
              }
            }
          },
          function endCB(err2, stdoutRing, stderrRing) {
            clearTimeout(self.processTimer);
            delete self.ffmpegProc;
            if (err2) {
              if (err2.message.match(/ffmpeg exited with code/)) {
                err2.message += ": " + utils2.extractError(stderrRing.get());
              }
              emitEnd(err2, stdoutRing.get(), stderrRing.get());
            } else {
              var flvmeta = self._outputs.filter(function(output2) {
                return output2.flags.flvmeta;
              });
              if (flvmeta.length) {
                self._getFlvtoolPath(function(err3, flvtool) {
                  if (err3) {
                    return emitEnd(err3);
                  }
                  async2.each(
                    flvmeta,
                    function(output2, cb) {
                      spawn(flvtool, ["-U", output2.target], { windowsHide: true }).on("error", function(err4) {
                        cb(new Error("Error running " + flvtool + " on " + output2.target + ": " + err4.message));
                      }).on("exit", function(code, signal) {
                        if (code !== 0 || signal) {
                          cb(
                            new Error(flvtool + " " + (signal ? "received signal " + signal : "exited with code " + code)) + " when running on " + output2.target
                          );
                        } else {
                          cb();
                        }
                      });
                    },
                    function(err4) {
                      if (err4) {
                        emitEnd(err4);
                      } else {
                        emitEnd(null, stdoutRing.get(), stderrRing.get());
                      }
                    }
                  );
                });
              } else {
                emitEnd(null, stdoutRing.get(), stderrRing.get());
              }
            }
          }
        );
      });
      return this;
    };
    proto.renice = function(niceness) {
      if (!utils2.isWindows) {
        niceness = niceness || 0;
        if (niceness < -20 || niceness > 20) {
          this.logger.warn("Invalid niceness value: " + niceness + ", must be between -20 and 20");
        }
        niceness = Math.min(20, Math.max(-20, niceness));
        this.options.niceness = niceness;
        if (this.ffmpegProc) {
          var logger = this.logger;
          var pid = this.ffmpegProc.pid;
          var renice = spawn("renice", [niceness, "-p", pid], { windowsHide: true });
          renice.on("error", function(err) {
            logger.warn("could not renice process " + pid + ": " + err.message);
          });
          renice.on("exit", function(code, signal) {
            if (signal) {
              logger.warn("could not renice process " + pid + ": renice was killed by signal " + signal);
            } else if (code) {
              logger.warn("could not renice process " + pid + ": renice exited with " + code);
            } else {
              logger.info("successfully reniced process " + pid + " to " + niceness + " niceness");
            }
          });
        }
      }
      return this;
    };
    proto.kill = function(signal) {
      if (!this.ffmpegProc) {
        this.logger.warn("No running ffmpeg process, cannot send signal");
      } else {
        this.ffmpegProc.kill(signal || "SIGKILL");
      }
      return this;
    };
  };
  return processor;
}
var capabilities;
var hasRequiredCapabilities;
function requireCapabilities() {
  if (hasRequiredCapabilities) return capabilities;
  hasRequiredCapabilities = 1;
  var fs2 = require$$0;
  var path2 = require$$1;
  var async2 = requireAsync();
  var utils2 = utilsExports;
  var avCodecRegexp = /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/;
  var ffCodecRegexp = /^\s*([D\.])([E\.])([VAS])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/;
  var ffEncodersRegexp = /\(encoders:([^\)]+)\)/;
  var ffDecodersRegexp = /\(decoders:([^\)]+)\)/;
  var encodersRegexp = /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/;
  var formatRegexp = /^\s*([D ])([E ])\s+([^ ]+)\s+(.*)$/;
  var lineBreakRegexp = /\r\n|\r|\n/;
  var filterRegexp = /^(?: [T\.][S\.][C\.] )?([^ ]+) +(AA?|VV?|\|)->(AA?|VV?|\|) +(.*)$/;
  var cache2 = {};
  capabilities = function(proto) {
    proto.setFfmpegPath = function(ffmpegPath) {
      cache2.ffmpegPath = ffmpegPath;
      return this;
    };
    proto.setFfprobePath = function(ffprobePath) {
      cache2.ffprobePath = ffprobePath;
      return this;
    };
    proto.setFlvtoolPath = function(flvtool) {
      cache2.flvtoolPath = flvtool;
      return this;
    };
    proto._forgetPaths = function() {
      delete cache2.ffmpegPath;
      delete cache2.ffprobePath;
      delete cache2.flvtoolPath;
    };
    proto._getFfmpegPath = function(callback) {
      if ("ffmpegPath" in cache2) {
        return callback(null, cache2.ffmpegPath);
      }
      async2.waterfall([
        // Try FFMPEG_PATH
        function(cb) {
          if (process.env.FFMPEG_PATH) {
            fs2.exists(process.env.FFMPEG_PATH, function(exists) {
              if (exists) {
                cb(null, process.env.FFMPEG_PATH);
              } else {
                cb(null, "");
              }
            });
          } else {
            cb(null, "");
          }
        },
        // Search in the PATH
        function(ffmpeg2, cb) {
          if (ffmpeg2.length) {
            return cb(null, ffmpeg2);
          }
          utils2.which("ffmpeg", function(err, ffmpeg22) {
            cb(err, ffmpeg22);
          });
        }
      ], function(err, ffmpeg2) {
        if (err) {
          callback(err);
        } else {
          callback(null, cache2.ffmpegPath = ffmpeg2 || "");
        }
      });
    };
    proto._getFfprobePath = function(callback) {
      var self = this;
      if ("ffprobePath" in cache2) {
        return callback(null, cache2.ffprobePath);
      }
      async2.waterfall([
        // Try FFPROBE_PATH
        function(cb) {
          if (process.env.FFPROBE_PATH) {
            fs2.exists(process.env.FFPROBE_PATH, function(exists) {
              cb(null, exists ? process.env.FFPROBE_PATH : "");
            });
          } else {
            cb(null, "");
          }
        },
        // Search in the PATH
        function(ffprobe2, cb) {
          if (ffprobe2.length) {
            return cb(null, ffprobe2);
          }
          utils2.which("ffprobe", function(err, ffprobe22) {
            cb(err, ffprobe22);
          });
        },
        // Search in the same directory as ffmpeg
        function(ffprobe2, cb) {
          if (ffprobe2.length) {
            return cb(null, ffprobe2);
          }
          self._getFfmpegPath(function(err, ffmpeg2) {
            if (err) {
              cb(err);
            } else if (ffmpeg2.length) {
              var name = utils2.isWindows ? "ffprobe.exe" : "ffprobe";
              var ffprobe22 = path2.join(path2.dirname(ffmpeg2), name);
              fs2.exists(ffprobe22, function(exists) {
                cb(null, exists ? ffprobe22 : "");
              });
            } else {
              cb(null, "");
            }
          });
        }
      ], function(err, ffprobe2) {
        if (err) {
          callback(err);
        } else {
          callback(null, cache2.ffprobePath = ffprobe2 || "");
        }
      });
    };
    proto._getFlvtoolPath = function(callback) {
      if ("flvtoolPath" in cache2) {
        return callback(null, cache2.flvtoolPath);
      }
      async2.waterfall([
        // Try FLVMETA_PATH
        function(cb) {
          if (process.env.FLVMETA_PATH) {
            fs2.exists(process.env.FLVMETA_PATH, function(exists) {
              cb(null, exists ? process.env.FLVMETA_PATH : "");
            });
          } else {
            cb(null, "");
          }
        },
        // Try FLVTOOL2_PATH
        function(flvtool, cb) {
          if (flvtool.length) {
            return cb(null, flvtool);
          }
          if (process.env.FLVTOOL2_PATH) {
            fs2.exists(process.env.FLVTOOL2_PATH, function(exists) {
              cb(null, exists ? process.env.FLVTOOL2_PATH : "");
            });
          } else {
            cb(null, "");
          }
        },
        // Search for flvmeta in the PATH
        function(flvtool, cb) {
          if (flvtool.length) {
            return cb(null, flvtool);
          }
          utils2.which("flvmeta", function(err, flvmeta) {
            cb(err, flvmeta);
          });
        },
        // Search for flvtool2 in the PATH
        function(flvtool, cb) {
          if (flvtool.length) {
            return cb(null, flvtool);
          }
          utils2.which("flvtool2", function(err, flvtool2) {
            cb(err, flvtool2);
          });
        }
      ], function(err, flvtool) {
        if (err) {
          callback(err);
        } else {
          callback(null, cache2.flvtoolPath = flvtool || "");
        }
      });
    };
    proto.availableFilters = proto.getAvailableFilters = function(callback) {
      if ("filters" in cache2) {
        return callback(null, cache2.filters);
      }
      this._spawnFfmpeg(["-filters"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
        if (err) {
          return callback(err);
        }
        var stdout = stdoutRing.get();
        var lines = stdout.split("\n");
        var data = {};
        var types = { A: "audio", V: "video", "|": "none" };
        lines.forEach(function(line) {
          var match = line.match(filterRegexp);
          if (match) {
            data[match[1]] = {
              description: match[4],
              input: types[match[2].charAt(0)],
              multipleInputs: match[2].length > 1,
              output: types[match[3].charAt(0)],
              multipleOutputs: match[3].length > 1
            };
          }
        });
        callback(null, cache2.filters = data);
      });
    };
    proto.availableCodecs = proto.getAvailableCodecs = function(callback) {
      if ("codecs" in cache2) {
        return callback(null, cache2.codecs);
      }
      this._spawnFfmpeg(["-codecs"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
        if (err) {
          return callback(err);
        }
        var stdout = stdoutRing.get();
        var lines = stdout.split(lineBreakRegexp);
        var data = {};
        lines.forEach(function(line) {
          var match = line.match(avCodecRegexp);
          if (match && match[7] !== "=") {
            data[match[7]] = {
              type: { "V": "video", "A": "audio", "S": "subtitle" }[match[3]],
              description: match[8],
              canDecode: match[1] === "D",
              canEncode: match[2] === "E",
              drawHorizBand: match[4] === "S",
              directRendering: match[5] === "D",
              weirdFrameTruncation: match[6] === "T"
            };
          }
          match = line.match(ffCodecRegexp);
          if (match && match[7] !== "=") {
            var codecData = data[match[7]] = {
              type: { "V": "video", "A": "audio", "S": "subtitle" }[match[3]],
              description: match[8],
              canDecode: match[1] === "D",
              canEncode: match[2] === "E",
              intraFrameOnly: match[4] === "I",
              isLossy: match[5] === "L",
              isLossless: match[6] === "S"
            };
            var encoders = codecData.description.match(ffEncodersRegexp);
            encoders = encoders ? encoders[1].trim().split(" ") : [];
            var decoders = codecData.description.match(ffDecodersRegexp);
            decoders = decoders ? decoders[1].trim().split(" ") : [];
            if (encoders.length || decoders.length) {
              var coderData = {};
              utils2.copy(codecData, coderData);
              delete coderData.canEncode;
              delete coderData.canDecode;
              encoders.forEach(function(name) {
                data[name] = {};
                utils2.copy(coderData, data[name]);
                data[name].canEncode = true;
              });
              decoders.forEach(function(name) {
                if (name in data) {
                  data[name].canDecode = true;
                } else {
                  data[name] = {};
                  utils2.copy(coderData, data[name]);
                  data[name].canDecode = true;
                }
              });
            }
          }
        });
        callback(null, cache2.codecs = data);
      });
    };
    proto.availableEncoders = proto.getAvailableEncoders = function(callback) {
      if ("encoders" in cache2) {
        return callback(null, cache2.encoders);
      }
      this._spawnFfmpeg(["-encoders"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
        if (err) {
          return callback(err);
        }
        var stdout = stdoutRing.get();
        var lines = stdout.split(lineBreakRegexp);
        var data = {};
        lines.forEach(function(line) {
          var match = line.match(encodersRegexp);
          if (match && match[7] !== "=") {
            data[match[7]] = {
              type: { "V": "video", "A": "audio", "S": "subtitle" }[match[1]],
              description: match[8],
              frameMT: match[2] === "F",
              sliceMT: match[3] === "S",
              experimental: match[4] === "X",
              drawHorizBand: match[5] === "B",
              directRendering: match[6] === "D"
            };
          }
        });
        callback(null, cache2.encoders = data);
      });
    };
    proto.availableFormats = proto.getAvailableFormats = function(callback) {
      if ("formats" in cache2) {
        return callback(null, cache2.formats);
      }
      this._spawnFfmpeg(["-formats"], { captureStdout: true, stdoutLines: 0 }, function(err, stdoutRing) {
        if (err) {
          return callback(err);
        }
        var stdout = stdoutRing.get();
        var lines = stdout.split(lineBreakRegexp);
        var data = {};
        lines.forEach(function(line) {
          var match = line.match(formatRegexp);
          if (match) {
            match[3].split(",").forEach(function(format2) {
              if (!(format2 in data)) {
                data[format2] = {
                  description: match[4],
                  canDemux: false,
                  canMux: false
                };
              }
              if (match[1] === "D") {
                data[format2].canDemux = true;
              }
              if (match[2] === "E") {
                data[format2].canMux = true;
              }
            });
          }
        });
        callback(null, cache2.formats = data);
      });
    };
    proto._checkCapabilities = function(callback) {
      var self = this;
      async2.waterfall([
        // Get available formats
        function(cb) {
          self.availableFormats(cb);
        },
        // Check whether specified formats are available
        function(formats2, cb) {
          var unavailable;
          unavailable = self._outputs.reduce(function(fmts, output2) {
            var format2 = output2.options.find("-f", 1);
            if (format2) {
              if (!(format2[0] in formats2) || !formats2[format2[0]].canMux) {
                fmts.push(format2);
              }
            }
            return fmts;
          }, []);
          if (unavailable.length === 1) {
            return cb(new Error("Output format " + unavailable[0] + " is not available"));
          } else if (unavailable.length > 1) {
            return cb(new Error("Output formats " + unavailable.join(", ") + " are not available"));
          }
          unavailable = self._inputs.reduce(function(fmts, input2) {
            var format2 = input2.options.find("-f", 1);
            if (format2) {
              if (!(format2[0] in formats2) || !formats2[format2[0]].canDemux) {
                fmts.push(format2[0]);
              }
            }
            return fmts;
          }, []);
          if (unavailable.length === 1) {
            return cb(new Error("Input format " + unavailable[0] + " is not available"));
          } else if (unavailable.length > 1) {
            return cb(new Error("Input formats " + unavailable.join(", ") + " are not available"));
          }
          cb();
        },
        // Get available codecs
        function(cb) {
          self.availableEncoders(cb);
        },
        // Check whether specified codecs are available and add strict experimental options if needed
        function(encoders, cb) {
          var unavailable;
          unavailable = self._outputs.reduce(function(cdcs, output2) {
            var acodec = output2.audio.find("-acodec", 1);
            if (acodec && acodec[0] !== "copy") {
              if (!(acodec[0] in encoders) || encoders[acodec[0]].type !== "audio") {
                cdcs.push(acodec[0]);
              }
            }
            return cdcs;
          }, []);
          if (unavailable.length === 1) {
            return cb(new Error("Audio codec " + unavailable[0] + " is not available"));
          } else if (unavailable.length > 1) {
            return cb(new Error("Audio codecs " + unavailable.join(", ") + " are not available"));
          }
          unavailable = self._outputs.reduce(function(cdcs, output2) {
            var vcodec = output2.video.find("-vcodec", 1);
            if (vcodec && vcodec[0] !== "copy") {
              if (!(vcodec[0] in encoders) || encoders[vcodec[0]].type !== "video") {
                cdcs.push(vcodec[0]);
              }
            }
            return cdcs;
          }, []);
          if (unavailable.length === 1) {
            return cb(new Error("Video codec " + unavailable[0] + " is not available"));
          } else if (unavailable.length > 1) {
            return cb(new Error("Video codecs " + unavailable.join(", ") + " are not available"));
          }
          cb();
        }
      ], callback);
    };
  };
  return capabilities;
}
var ffprobe;
var hasRequiredFfprobe;
function requireFfprobe() {
  if (hasRequiredFfprobe) return ffprobe;
  hasRequiredFfprobe = 1;
  var spawn = require$$0$1.spawn;
  function legacyTag(key) {
    return key.match(/^TAG:/);
  }
  function legacyDisposition(key) {
    return key.match(/^DISPOSITION:/);
  }
  function parseFfprobeOutput(out) {
    var lines = out.split(/\r\n|\r|\n/);
    lines = lines.filter(function(line2) {
      return line2.length > 0;
    });
    var data = {
      streams: [],
      format: {},
      chapters: []
    };
    function parseBlock(name) {
      var data2 = {};
      var line2 = lines.shift();
      while (typeof line2 !== "undefined") {
        if (line2.toLowerCase() == "[/" + name + "]") {
          return data2;
        } else if (line2.match(/^\[/)) {
          line2 = lines.shift();
          continue;
        }
        var kv = line2.match(/^([^=]+)=(.*)$/);
        if (kv) {
          if (!kv[1].match(/^TAG:/) && kv[2].match(/^[0-9]+(\.[0-9]+)?$/)) {
            data2[kv[1]] = Number(kv[2]);
          } else {
            data2[kv[1]] = kv[2];
          }
        }
        line2 = lines.shift();
      }
      return data2;
    }
    var line = lines.shift();
    while (typeof line !== "undefined") {
      if (line.match(/^\[stream/i)) {
        var stream2 = parseBlock("stream");
        data.streams.push(stream2);
      } else if (line.match(/^\[chapter/i)) {
        var chapter = parseBlock("chapter");
        data.chapters.push(chapter);
      } else if (line.toLowerCase() === "[format]") {
        data.format = parseBlock("format");
      }
      line = lines.shift();
    }
    return data;
  }
  ffprobe = function(proto) {
    proto.ffprobe = function() {
      var input2, index = null, options = [], callback;
      var callback = arguments[arguments.length - 1];
      var ended = false;
      function handleCallback(err, data) {
        if (!ended) {
          ended = true;
          callback(err, data);
        }
      }
      switch (arguments.length) {
        case 3:
          index = arguments[0];
          options = arguments[1];
          break;
        case 2:
          if (typeof arguments[0] === "number") {
            index = arguments[0];
          } else if (Array.isArray(arguments[0])) {
            options = arguments[0];
          }
          break;
      }
      if (index === null) {
        if (!this._currentInput) {
          return handleCallback(new Error("No input specified"));
        }
        input2 = this._currentInput;
      } else {
        input2 = this._inputs[index];
        if (!input2) {
          return handleCallback(new Error("Invalid input index"));
        }
      }
      this._getFfprobePath(function(err, path2) {
        if (err) {
          return handleCallback(err);
        } else if (!path2) {
          return handleCallback(new Error("Cannot find ffprobe"));
        }
        var stdout = "";
        var stdoutClosed = false;
        var stderr = "";
        var stderrClosed = false;
        var src = input2.isStream ? "pipe:0" : input2.source;
        var ffprobe2 = spawn(path2, ["-show_streams", "-show_format"].concat(options, src), { windowsHide: true });
        if (input2.isStream) {
          ffprobe2.stdin.on("error", function(err2) {
            if (["ECONNRESET", "EPIPE", "EOF"].indexOf(err2.code) >= 0) {
              return;
            }
            handleCallback(err2);
          });
          ffprobe2.stdin.on("close", function() {
            input2.source.pause();
            input2.source.unpipe(ffprobe2.stdin);
          });
          input2.source.pipe(ffprobe2.stdin);
        }
        ffprobe2.on("error", callback);
        var exitError = null;
        function handleExit(err2) {
          if (err2) {
            exitError = err2;
          }
          if (processExited && stdoutClosed && stderrClosed) {
            if (exitError) {
              if (stderr) {
                exitError.message += "\n" + stderr;
              }
              return handleCallback(exitError);
            }
            var data = parseFfprobeOutput(stdout);
            [data.format].concat(data.streams).forEach(function(target) {
              if (target) {
                var legacyTagKeys = Object.keys(target).filter(legacyTag);
                if (legacyTagKeys.length) {
                  target.tags = target.tags || {};
                  legacyTagKeys.forEach(function(tagKey) {
                    target.tags[tagKey.substr(4)] = target[tagKey];
                    delete target[tagKey];
                  });
                }
                var legacyDispositionKeys = Object.keys(target).filter(legacyDisposition);
                if (legacyDispositionKeys.length) {
                  target.disposition = target.disposition || {};
                  legacyDispositionKeys.forEach(function(dispositionKey) {
                    target.disposition[dispositionKey.substr(12)] = target[dispositionKey];
                    delete target[dispositionKey];
                  });
                }
              }
            });
            handleCallback(null, data);
          }
        }
        var processExited = false;
        ffprobe2.on("exit", function(code, signal) {
          processExited = true;
          if (code) {
            handleExit(new Error("ffprobe exited with code " + code));
          } else if (signal) {
            handleExit(new Error("ffprobe was killed with signal " + signal));
          } else {
            handleExit();
          }
        });
        ffprobe2.stdout.on("data", function(data) {
          stdout += data;
        });
        ffprobe2.stdout.on("close", function() {
          stdoutClosed = true;
          handleExit();
        });
        ffprobe2.stderr.on("data", function(data) {
          stderr += data;
        });
        ffprobe2.stderr.on("close", function() {
          stderrClosed = true;
          handleExit();
        });
      });
    };
  };
  return ffprobe;
}
var recipes;
var hasRequiredRecipes;
function requireRecipes() {
  if (hasRequiredRecipes) return recipes;
  hasRequiredRecipes = 1;
  var fs2 = require$$0;
  var path2 = require$$1;
  var PassThrough = require$$0$2.PassThrough;
  var async2 = requireAsync();
  var utils2 = utilsExports;
  recipes = function recipes2(proto) {
    proto.saveToFile = proto.save = function(output2) {
      this.output(output2).run();
      return this;
    };
    proto.writeToStream = proto.pipe = proto.stream = function(stream2, options) {
      if (stream2 && !("writable" in stream2)) {
        options = stream2;
        stream2 = void 0;
      }
      if (!stream2) {
        if (process.version.match(/v0\.8\./)) {
          throw new Error("PassThrough stream is not supported on node v0.8");
        }
        stream2 = new PassThrough();
      }
      this.output(stream2, options).run();
      return stream2;
    };
    proto.takeScreenshots = proto.thumbnail = proto.thumbnails = proto.screenshot = proto.screenshots = function(config2, folder) {
      var self = this;
      var source = this._currentInput.source;
      config2 = config2 || { count: 1 };
      if (typeof config2 === "number") {
        config2 = {
          count: config2
        };
      }
      if (!("folder" in config2)) {
        config2.folder = folder || ".";
      }
      if ("timestamps" in config2) {
        config2.timemarks = config2.timestamps;
      }
      if (!("timemarks" in config2)) {
        if (!config2.count) {
          throw new Error("Cannot take screenshots: neither a count nor a timemark list are specified");
        }
        var interval = 100 / (1 + config2.count);
        config2.timemarks = [];
        for (var i = 0; i < config2.count; i++) {
          config2.timemarks.push(interval * (i + 1) + "%");
        }
      }
      if ("size" in config2) {
        var fixedSize = config2.size.match(/^(\d+)x(\d+)$/);
        var fixedWidth = config2.size.match(/^(\d+)x\?$/);
        var fixedHeight = config2.size.match(/^\?x(\d+)$/);
        var percentSize = config2.size.match(/^(\d+)%$/);
        if (!fixedSize && !fixedWidth && !fixedHeight && !percentSize) {
          throw new Error("Invalid size parameter: " + config2.size);
        }
      }
      var metadata2;
      function getMetadata(cb) {
        if (metadata2) {
          cb(null, metadata2);
        } else {
          self.ffprobe(function(err, meta) {
            metadata2 = meta;
            cb(err, meta);
          });
        }
      }
      async2.waterfall([
        // Compute percent timemarks if any
        function computeTimemarks(next) {
          if (config2.timemarks.some(function(t2) {
            return ("" + t2).match(/^[\d.]+%$/);
          })) {
            if (typeof source !== "string") {
              return next(new Error("Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks"));
            }
            getMetadata(function(err, meta) {
              if (err) {
                next(err);
              } else {
                var vstream = meta.streams.reduce(function(biggest, stream2) {
                  if (stream2.codec_type === "video" && stream2.width * stream2.height > biggest.width * biggest.height) {
                    return stream2;
                  } else {
                    return biggest;
                  }
                }, { width: 0, height: 0 });
                if (vstream.width === 0) {
                  return next(new Error("No video stream in input, cannot take screenshots"));
                }
                var duration = Number(vstream.duration);
                if (isNaN(duration)) {
                  duration = Number(meta.format.duration);
                }
                if (isNaN(duration)) {
                  return next(new Error("Could not get input duration, please specify fixed timemarks"));
                }
                config2.timemarks = config2.timemarks.map(function(mark) {
                  if (("" + mark).match(/^([\d.]+)%$/)) {
                    return duration * parseFloat(mark) / 100;
                  } else {
                    return mark;
                  }
                });
                next();
              }
            });
          } else {
            next();
          }
        },
        // Turn all timemarks into numbers and sort them
        function normalizeTimemarks(next) {
          config2.timemarks = config2.timemarks.map(function(mark) {
            return utils2.timemarkToSeconds(mark);
          }).sort(function(a, b) {
            return a - b;
          });
          next();
        },
        // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
        function fixPattern(next) {
          var pattern = config2.filename || "tn.png";
          if (pattern.indexOf(".") === -1) {
            pattern += ".png";
          }
          if (config2.timemarks.length > 1 && !pattern.match(/%(s|0*i)/)) {
            var ext = path2.extname(pattern);
            pattern = path2.join(path2.dirname(pattern), path2.basename(pattern, ext) + "_%i" + ext);
          }
          next(null, pattern);
        },
        // Replace filename tokens (%f, %b) in pattern
        function replaceFilenameTokens(pattern, next) {
          if (pattern.match(/%[bf]/)) {
            if (typeof source !== "string") {
              return next(new Error("Cannot replace %f or %b when using an input stream"));
            }
            pattern = pattern.replace(/%f/g, path2.basename(source)).replace(/%b/g, path2.basename(source, path2.extname(source)));
          }
          next(null, pattern);
        },
        // Compute size if needed
        function getSize(pattern, next) {
          if (pattern.match(/%[whr]/)) {
            if (fixedSize) {
              return next(null, pattern, fixedSize[1], fixedSize[2]);
            }
            getMetadata(function(err, meta) {
              if (err) {
                return next(new Error("Could not determine video resolution to replace %w, %h or %r"));
              }
              var vstream = meta.streams.reduce(function(biggest, stream2) {
                if (stream2.codec_type === "video" && stream2.width * stream2.height > biggest.width * biggest.height) {
                  return stream2;
                } else {
                  return biggest;
                }
              }, { width: 0, height: 0 });
              if (vstream.width === 0) {
                return next(new Error("No video stream in input, cannot replace %w, %h or %r"));
              }
              var width = vstream.width;
              var height = vstream.height;
              if (fixedWidth) {
                height = height * Number(fixedWidth[1]) / width;
                width = Number(fixedWidth[1]);
              } else if (fixedHeight) {
                width = width * Number(fixedHeight[1]) / height;
                height = Number(fixedHeight[1]);
              } else if (percentSize) {
                width = width * Number(percentSize[1]) / 100;
                height = height * Number(percentSize[1]) / 100;
              }
              next(null, pattern, Math.round(width / 2) * 2, Math.round(height / 2) * 2);
            });
          } else {
            next(null, pattern, -1, -1);
          }
        },
        // Replace size tokens (%w, %h, %r) in pattern
        function replaceSizeTokens(pattern, width, height, next) {
          pattern = pattern.replace(/%r/g, "%wx%h").replace(/%w/g, width).replace(/%h/g, height);
          next(null, pattern);
        },
        // Replace variable tokens in pattern (%s, %i) and generate filename list
        function replaceVariableTokens(pattern, next) {
          var filenames = config2.timemarks.map(function(t2, i2) {
            return pattern.replace(/%s/g, utils2.timemarkToSeconds(t2)).replace(/%(0*)i/g, function(match, padding) {
              var idx = "" + (i2 + 1);
              return padding.substr(0, Math.max(0, padding.length + 1 - idx.length)) + idx;
            });
          });
          self.emit("filenames", filenames);
          next(null, filenames);
        },
        // Create output directory
        function createDirectory(filenames, next) {
          fs2.exists(config2.folder, function(exists) {
            if (!exists) {
              fs2.mkdir(config2.folder, function(err) {
                if (err) {
                  next(err);
                } else {
                  next(null, filenames);
                }
              });
            } else {
              next(null, filenames);
            }
          });
        }
      ], function runCommand(err, filenames) {
        if (err) {
          return self.emit("error", err);
        }
        var count = config2.timemarks.length;
        var split;
        var filters = [split = {
          filter: "split",
          options: count,
          outputs: []
        }];
        if ("size" in config2) {
          self.size(config2.size);
          var sizeFilters = self._currentOutput.sizeFilters.get().map(function(f, i3) {
            if (i3 > 0) {
              f.inputs = "size" + (i3 - 1);
            }
            f.outputs = "size" + i3;
            return f;
          });
          split.inputs = "size" + (sizeFilters.length - 1);
          filters = sizeFilters.concat(filters);
          self._currentOutput.sizeFilters.clear();
        }
        var first = 0;
        for (var i2 = 0; i2 < count; i2++) {
          var stream2 = "screen" + i2;
          split.outputs.push(stream2);
          if (i2 === 0) {
            first = config2.timemarks[i2];
            self.seekInput(first);
          }
          self.output(path2.join(config2.folder, filenames[i2])).frames(1).map(stream2);
          if (i2 > 0) {
            self.seek(config2.timemarks[i2] - first);
          }
        }
        self.complexFilter(filters);
        self.run();
      });
      return this;
    };
    proto.mergeToFile = proto.concatenate = proto.concat = function(target, options) {
      var fileInput = this._inputs.filter(function(input2) {
        return !input2.isStream;
      })[0];
      var self = this;
      this.ffprobe(this._inputs.indexOf(fileInput), function(err, data) {
        if (err) {
          return self.emit("error", err);
        }
        var hasAudioStreams = data.streams.some(function(stream2) {
          return stream2.codec_type === "audio";
        });
        var hasVideoStreams = data.streams.some(function(stream2) {
          return stream2.codec_type === "video";
        });
        self.output(target, options).complexFilter({
          filter: "concat",
          options: {
            n: self._inputs.length,
            v: hasVideoStreams ? 1 : 0,
            a: hasAudioStreams ? 1 : 0
          }
        }).run();
      });
      return this;
    };
  };
  return recipes;
}
var path$2 = require$$1;
var util$1 = require$$2;
var EventEmitter = require$$0$3.EventEmitter;
var utils = utilsExports;
function FfmpegCommand(input2, options) {
  if (!(this instanceof FfmpegCommand)) {
    return new FfmpegCommand(input2, options);
  }
  EventEmitter.call(this);
  if (typeof input2 === "object" && !("readable" in input2)) {
    options = input2;
  } else {
    options = options || {};
    options.source = input2;
  }
  this._inputs = [];
  if (options.source) {
    this.input(options.source);
  }
  this._outputs = [];
  this.output();
  var self = this;
  ["_global", "_complexFilters"].forEach(function(prop) {
    self[prop] = utils.args();
  });
  options.stdoutLines = "stdoutLines" in options ? options.stdoutLines : 100;
  options.presets = options.presets || options.preset || path$2.join(__dirname, "presets");
  options.niceness = options.niceness || options.priority || 0;
  this.options = options;
  this.logger = options.logger || {
    debug: function() {
    },
    info: function() {
    },
    warn: function() {
    },
    error: function() {
    }
  };
}
util$1.inherits(FfmpegCommand, EventEmitter);
var fluentFfmpeg$1 = FfmpegCommand;
FfmpegCommand.prototype.clone = function() {
  var clone2 = new FfmpegCommand();
  var self = this;
  clone2.options = this.options;
  clone2.logger = this.logger;
  clone2._inputs = this._inputs.map(function(input2) {
    return {
      source: input2.source,
      options: input2.options.clone()
    };
  });
  if ("target" in this._outputs[0]) {
    clone2._outputs = [];
    clone2.output();
  } else {
    clone2._outputs = [
      clone2._currentOutput = {
        flags: {}
      }
    ];
    ["audio", "audioFilters", "video", "videoFilters", "sizeFilters", "options"].forEach(function(key) {
      clone2._currentOutput[key] = self._currentOutput[key].clone();
    });
    if (this._currentOutput.sizeData) {
      clone2._currentOutput.sizeData = {};
      utils.copy(this._currentOutput.sizeData, clone2._currentOutput.sizeData);
    }
    utils.copy(this._currentOutput.flags, clone2._currentOutput.flags);
  }
  ["_global", "_complexFilters"].forEach(function(prop) {
    clone2[prop] = self[prop].clone();
  });
  return clone2;
};
requireInputs()(FfmpegCommand.prototype);
requireAudio()(FfmpegCommand.prototype);
requireVideo()(FfmpegCommand.prototype);
requireVideosize()(FfmpegCommand.prototype);
requireOutput()(FfmpegCommand.prototype);
requireCustom()(FfmpegCommand.prototype);
requireMisc()(FfmpegCommand.prototype);
requireProcessor()(FfmpegCommand.prototype);
requireCapabilities()(FfmpegCommand.prototype);
FfmpegCommand.setFfmpegPath = function(path2) {
  new FfmpegCommand().setFfmpegPath(path2);
};
FfmpegCommand.setFfprobePath = function(path2) {
  new FfmpegCommand().setFfprobePath(path2);
};
FfmpegCommand.setFlvtoolPath = function(path2) {
  new FfmpegCommand().setFlvtoolPath(path2);
};
FfmpegCommand.availableFilters = FfmpegCommand.getAvailableFilters = function(callback) {
  new FfmpegCommand().availableFilters(callback);
};
FfmpegCommand.availableCodecs = FfmpegCommand.getAvailableCodecs = function(callback) {
  new FfmpegCommand().availableCodecs(callback);
};
FfmpegCommand.availableFormats = FfmpegCommand.getAvailableFormats = function(callback) {
  new FfmpegCommand().availableFormats(callback);
};
FfmpegCommand.availableEncoders = FfmpegCommand.getAvailableEncoders = function(callback) {
  new FfmpegCommand().availableEncoders(callback);
};
requireFfprobe()(FfmpegCommand.prototype);
FfmpegCommand.ffprobe = function(file) {
  var instance = new FfmpegCommand(file);
  instance.ffprobe.apply(instance, Array.prototype.slice.call(arguments, 1));
};
requireRecipes()(FfmpegCommand.prototype);
var fluentFfmpeg = fluentFfmpeg$1;
const ffmpeg = /* @__PURE__ */ main.getDefaultExportFromCjs(fluentFfmpeg);
const defined = function(val) {
  return typeof val !== "undefined" && val !== null;
};
const object = function(val) {
  return typeof val === "object";
};
const plainObject = function(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
};
const fn = function(val) {
  return typeof val === "function";
};
const bool$1 = function(val) {
  return typeof val === "boolean";
};
const buffer = function(val) {
  return val instanceof Buffer;
};
const typedArray = function(val) {
  if (defined(val)) {
    switch (val.constructor) {
      case Uint8Array:
      case Uint8ClampedArray:
      case Int8Array:
      case Uint16Array:
      case Int16Array:
      case Uint32Array:
      case Int32Array:
      case Float32Array:
      case Float64Array:
        return true;
    }
  }
  return false;
};
const arrayBuffer = function(val) {
  return val instanceof ArrayBuffer;
};
const string = function(val) {
  return typeof val === "string" && val.length > 0;
};
const number = function(val) {
  return typeof val === "number" && !Number.isNaN(val);
};
const integer = function(val) {
  return Number.isInteger(val);
};
const inRange = function(val, min, max) {
  return val >= min && val <= max;
};
const inArray = function(val, list) {
  return list.includes(val);
};
const invalidParameterError = function(name, expected, actual) {
  return new Error(
    `Expected ${expected} for ${name} but received ${actual} of type ${typeof actual}`
  );
};
const nativeError = function(native, context) {
  context.message = native.message;
  return context;
};
var is$9 = {
  defined,
  object,
  plainObject,
  fn,
  bool: bool$1,
  buffer,
  typedArray,
  arrayBuffer,
  string,
  number,
  integer,
  inRange,
  inArray,
  invalidParameterError,
  nativeError
};
var sharp$5 = { exports: {} };
const isLinux$1 = () => process.platform === "linux";
let report = null;
const getReport$1 = () => {
  if (!report) {
    if (isLinux$1() && process.report) {
      const orig = process.report.excludeNetwork;
      process.report.excludeNetwork = true;
      report = process.report.getReport();
      process.report.excludeNetwork = orig;
    } else {
      report = {};
    }
  }
  return report;
};
var process_1 = { isLinux: isLinux$1, getReport: getReport$1 };
const fs = require$$0;
const LDD_PATH$1 = "/usr/bin/ldd";
const SELF_PATH$1 = "/proc/self/exe";
const MAX_LENGTH$2 = 2048;
const readFileSync$1 = (path2) => {
  const fd = fs.openSync(path2, "r");
  const buffer2 = Buffer.alloc(MAX_LENGTH$2);
  const bytesRead = fs.readSync(fd, buffer2, 0, MAX_LENGTH$2, 0);
  fs.close(fd);
  return buffer2.subarray(0, bytesRead);
};
const readFile$1 = (path2) => new Promise((resolve, reject) => {
  fs.open(path2, "r", (err, fd) => {
    if (err) {
      reject(err);
    } else {
      const buffer2 = Buffer.alloc(MAX_LENGTH$2);
      fs.read(fd, buffer2, 0, MAX_LENGTH$2, 0, (_, bytesRead) => {
        resolve(buffer2.subarray(0, bytesRead));
        fs.close(fd, () => {
        });
      });
    }
  });
});
var filesystem = {
  LDD_PATH: LDD_PATH$1,
  SELF_PATH: SELF_PATH$1,
  readFileSync: readFileSync$1,
  readFile: readFile$1
};
const interpreterPath$1 = (elf2) => {
  if (elf2.length < 64) {
    return null;
  }
  if (elf2.readUInt32BE(0) !== 2135247942) {
    return null;
  }
  if (elf2.readUInt8(4) !== 2) {
    return null;
  }
  if (elf2.readUInt8(5) !== 1) {
    return null;
  }
  const offset = elf2.readUInt32LE(32);
  const size = elf2.readUInt16LE(54);
  const count = elf2.readUInt16LE(56);
  for (let i = 0; i < count; i++) {
    const headerOffset = offset + i * size;
    const type = elf2.readUInt32LE(headerOffset);
    if (type === 3) {
      const fileOffset = elf2.readUInt32LE(headerOffset + 8);
      const fileSize = elf2.readUInt32LE(headerOffset + 32);
      return elf2.subarray(fileOffset, fileOffset + fileSize).toString().replace(/\0.*$/g, "");
    }
  }
  return null;
};
var elf = {
  interpreterPath: interpreterPath$1
};
const childProcess = require$$0$1;
const { isLinux, getReport } = process_1;
const { LDD_PATH, SELF_PATH, readFile, readFileSync } = filesystem;
const { interpreterPath } = elf;
let cachedFamilyInterpreter;
let cachedFamilyFilesystem;
let cachedVersionFilesystem;
const command = "getconf GNU_LIBC_VERSION 2>&1 || true; ldd --version 2>&1 || true";
let commandOut = "";
const safeCommand = () => {
  if (!commandOut) {
    return new Promise((resolve) => {
      childProcess.exec(command, (err, out) => {
        commandOut = err ? " " : out;
        resolve(commandOut);
      });
    });
  }
  return commandOut;
};
const safeCommandSync = () => {
  if (!commandOut) {
    try {
      commandOut = childProcess.execSync(command, { encoding: "utf8" });
    } catch (_err) {
      commandOut = " ";
    }
  }
  return commandOut;
};
const GLIBC = "glibc";
const RE_GLIBC_VERSION = /LIBC[a-z0-9 \-).]*?(\d+\.\d+)/i;
const MUSL = "musl";
const isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
const familyFromReport = () => {
  const report2 = getReport();
  if (report2.header && report2.header.glibcVersionRuntime) {
    return GLIBC;
  }
  if (Array.isArray(report2.sharedObjects)) {
    if (report2.sharedObjects.some(isFileMusl)) {
      return MUSL;
    }
  }
  return null;
};
const familyFromCommand = (out) => {
  const [getconf, ldd1] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) {
    return GLIBC;
  }
  if (ldd1 && ldd1.includes(MUSL)) {
    return MUSL;
  }
  return null;
};
const familyFromInterpreterPath = (path2) => {
  if (path2) {
    if (path2.includes("/ld-musl-")) {
      return MUSL;
    } else if (path2.includes("/ld-linux-")) {
      return GLIBC;
    }
  }
  return null;
};
const getFamilyFromLddContent = (content) => {
  content = content.toString();
  if (content.includes("musl")) {
    return MUSL;
  }
  if (content.includes("GNU C Library")) {
    return GLIBC;
  }
  return null;
};
const familyFromFilesystem = async () => {
  if (cachedFamilyFilesystem !== void 0) {
    return cachedFamilyFilesystem;
  }
  cachedFamilyFilesystem = null;
  try {
    const lddContent = await readFile(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch (e) {
  }
  return cachedFamilyFilesystem;
};
const familyFromFilesystemSync = () => {
  if (cachedFamilyFilesystem !== void 0) {
    return cachedFamilyFilesystem;
  }
  cachedFamilyFilesystem = null;
  try {
    const lddContent = readFileSync(LDD_PATH);
    cachedFamilyFilesystem = getFamilyFromLddContent(lddContent);
  } catch (e) {
  }
  return cachedFamilyFilesystem;
};
const familyFromInterpreter = async () => {
  if (cachedFamilyInterpreter !== void 0) {
    return cachedFamilyInterpreter;
  }
  cachedFamilyInterpreter = null;
  try {
    const selfContent = await readFile(SELF_PATH);
    const path2 = interpreterPath(selfContent);
    cachedFamilyInterpreter = familyFromInterpreterPath(path2);
  } catch (e) {
  }
  return cachedFamilyInterpreter;
};
const familyFromInterpreterSync = () => {
  if (cachedFamilyInterpreter !== void 0) {
    return cachedFamilyInterpreter;
  }
  cachedFamilyInterpreter = null;
  try {
    const selfContent = readFileSync(SELF_PATH);
    const path2 = interpreterPath(selfContent);
    cachedFamilyInterpreter = familyFromInterpreterPath(path2);
  } catch (e) {
  }
  return cachedFamilyInterpreter;
};
const family = async () => {
  let family2 = null;
  if (isLinux()) {
    family2 = await familyFromInterpreter();
    if (!family2) {
      family2 = await familyFromFilesystem();
      if (!family2) {
        family2 = familyFromReport();
      }
      if (!family2) {
        const out = await safeCommand();
        family2 = familyFromCommand(out);
      }
    }
  }
  return family2;
};
const familySync$1 = () => {
  let family2 = null;
  if (isLinux()) {
    family2 = familyFromInterpreterSync();
    if (!family2) {
      family2 = familyFromFilesystemSync();
      if (!family2) {
        family2 = familyFromReport();
      }
      if (!family2) {
        const out = safeCommandSync();
        family2 = familyFromCommand(out);
      }
    }
  }
  return family2;
};
const isNonGlibcLinux = async () => isLinux() && await family() !== GLIBC;
const isNonGlibcLinuxSync = () => isLinux() && familySync$1() !== GLIBC;
const versionFromFilesystem = async () => {
  if (cachedVersionFilesystem !== void 0) {
    return cachedVersionFilesystem;
  }
  cachedVersionFilesystem = null;
  try {
    const lddContent = await readFile(LDD_PATH);
    const versionMatch = lddContent.match(RE_GLIBC_VERSION);
    if (versionMatch) {
      cachedVersionFilesystem = versionMatch[1];
    }
  } catch (e) {
  }
  return cachedVersionFilesystem;
};
const versionFromFilesystemSync = () => {
  if (cachedVersionFilesystem !== void 0) {
    return cachedVersionFilesystem;
  }
  cachedVersionFilesystem = null;
  try {
    const lddContent = readFileSync(LDD_PATH);
    const versionMatch = lddContent.match(RE_GLIBC_VERSION);
    if (versionMatch) {
      cachedVersionFilesystem = versionMatch[1];
    }
  } catch (e) {
  }
  return cachedVersionFilesystem;
};
const versionFromReport = () => {
  const report2 = getReport();
  if (report2.header && report2.header.glibcVersionRuntime) {
    return report2.header.glibcVersionRuntime;
  }
  return null;
};
const versionSuffix = (s) => s.trim().split(/\s+/)[1];
const versionFromCommand = (out) => {
  const [getconf, ldd1, ldd2] = out.split(/[\r\n]+/);
  if (getconf && getconf.includes(GLIBC)) {
    return versionSuffix(getconf);
  }
  if (ldd1 && ldd2 && ldd1.includes(MUSL)) {
    return versionSuffix(ldd2);
  }
  return null;
};
const version$1 = async () => {
  let version2 = null;
  if (isLinux()) {
    version2 = await versionFromFilesystem();
    if (!version2) {
      version2 = versionFromReport();
    }
    if (!version2) {
      const out = await safeCommand();
      version2 = versionFromCommand(out);
    }
  }
  return version2;
};
const versionSync$1 = () => {
  let version2 = null;
  if (isLinux()) {
    version2 = versionFromFilesystemSync();
    if (!version2) {
      version2 = versionFromReport();
    }
    if (!version2) {
      const out = safeCommandSync();
      version2 = versionFromCommand(out);
    }
  }
  return version2;
};
var detectLibc$2 = {
  GLIBC,
  MUSL,
  family,
  familySync: familySync$1,
  isNonGlibcLinux,
  isNonGlibcLinuxSync,
  version: version$1,
  versionSync: versionSync$1
};
const debug$1 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
};
var debug_1 = debug$1;
const MAX_LENGTH$1 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991;
const MAX_SAFE_COMPONENT_LENGTH = 16;
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;
var constants = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
var re$2 = { exports: {} };
(function(module2, exports2) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2,
    MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH2,
    MAX_LENGTH: MAX_LENGTH2
  } = constants;
  const debug2 = debug_1;
  exports2 = module2.exports = {};
  const re2 = exports2.re = [];
  const safeRe = exports2.safeRe = [];
  const src = exports2.src = [];
  const safeSrc = exports2.safeSrc = [];
  const t2 = exports2.t = {};
  let R = 0;
  const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  const safeRegexReplacements = [
    ["\\s", 1],
    ["\\d", MAX_LENGTH2],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH2]
  ];
  const makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
  const createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug2(name, index, value);
    t2[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t2.NONNUMERICIDENTIFIER]}|${src[t2.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t2.NONNUMERICIDENTIFIER]}|${src[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t2.PRERELEASEIDENTIFIER]}(?:\\.${src[t2.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t2.BUILDIDENTIFIER]}(?:\\.${src[t2.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t2.MAINVERSION]}${src[t2.PRERELEASE]}?${src[t2.BUILD]}?`);
  createToken("FULL", `^${src[t2.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t2.MAINVERSIONLOOSE]}${src[t2.PRERELEASELOOSE]}?${src[t2.BUILD]}?`);
  createToken("LOOSE", `^${src[t2.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:${src[t2.PRERELEASE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:${src[t2.PRERELEASELOOSE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?`);
  createToken("COERCE", `${src[t2.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t2.COERCEPLAIN] + `(?:${src[t2.PRERELEASE]})?(?:${src[t2.BUILD]})?(?:$|[^\\d])`);
  createToken("COERCERTL", src[t2.COERCE], true);
  createToken("COERCERTLFULL", src[t2.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t2.LONETILDE]}\\s+`, true);
  exports2.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t2.LONECARET]}\\s+`, true);
  exports2.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t2.GTLT]}\\s*(${src[t2.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]}|${src[t2.XRANGEPLAIN]})`, true);
  exports2.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t2.XRANGEPLAIN]})\\s+-\\s+(${src[t2.XRANGEPLAIN]})\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t2.XRANGEPLAINLOOSE]})\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$2, re$2.exports);
var reExports = re$2.exports;
const looseOption = Object.freeze({ loose: true });
const emptyOpts = Object.freeze({});
const parseOptions$1 = (options) => {
  if (!options) {
    return emptyOpts;
  }
  if (typeof options !== "object") {
    return looseOption;
  }
  return options;
};
var parseOptions_1 = parseOptions$1;
const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  const anum = numeric.test(a);
  const bnum = numeric.test(b);
  if (anum && bnum) {
    a = +a;
    b = +b;
  }
  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
var identifiers = {
  compareIdentifiers: compareIdentifiers$1
};
const debug = debug_1;
const { MAX_LENGTH, MAX_SAFE_INTEGER } = constants;
const { safeRe: re$1, t: t$1 } = reExports;
const parseOptions = parseOptions_1;
const { compareIdentifiers } = identifiers;
let SemVer$3 = class SemVer {
  constructor(version2, options) {
    options = parseOptions(options);
    if (version2 instanceof SemVer) {
      if (version2.loose === !!options.loose && version2.includePrerelease === !!options.includePrerelease) {
        return version2;
      } else {
        version2 = version2.version;
      }
    } else if (typeof version2 !== "string") {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version2}".`);
    }
    if (version2.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      );
    }
    debug("SemVer", version2, options);
    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;
    const m = version2.trim().match(options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);
    if (!m) {
      throw new TypeError(`Invalid Version: ${version2}`);
    }
    this.raw = version2;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError("Invalid major version");
    }
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError("Invalid minor version");
    }
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError("Invalid patch version");
    }
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split(".").map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num;
          }
        }
        return id;
      });
    }
    this.build = m[5] ? m[5].split(".") : [];
    this.format();
  }
  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join(".")}`;
    }
    return this.version;
  }
  toString() {
    return this.version;
  }
  compare(other) {
    debug("SemVer.compare", this.version, this.options, other);
    if (!(other instanceof SemVer)) {
      if (typeof other === "string" && other === this.version) {
        return 0;
      }
      other = new SemVer(other, this.options);
    }
    if (other.version === this.version) {
      return 0;
    }
    return this.compareMain(other) || this.comparePre(other);
  }
  compareMain(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  }
  comparePre(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }
    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug("prerelease compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  compareBuild(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug("build compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release, identifier, identifierBase) {
    if (release.startsWith("pre")) {
      if (!identifier && identifierBase === false) {
        throw new Error("invalid increment argument: identifier is empty");
      }
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re$1[t$1.PRERELEASELOOSE] : re$1[t$1.PRERELEASE]);
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`);
        }
      }
    }
    switch (release) {
      case "premajor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "preminor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "prepatch":
        this.prerelease.length = 0;
        this.inc("patch", identifier, identifierBase);
        this.inc("pre", identifier, identifierBase);
        break;
      case "prerelease":
        if (this.prerelease.length === 0) {
          this.inc("patch", identifier, identifierBase);
        }
        this.inc("pre", identifier, identifierBase);
        break;
      case "release":
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`);
        }
        this.prerelease.length = 0;
        break;
      case "major":
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case "minor":
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break;
      case "patch":
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break;
      case "pre": {
        const base = Number(identifierBase) ? 1 : 0;
        if (this.prerelease.length === 0) {
          this.prerelease = [base];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === "number") {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            if (identifier === this.prerelease.join(".") && identifierBase === false) {
              throw new Error("invalid increment argument: identifier already exists");
            }
            this.prerelease.push(base);
          }
        }
        if (identifier) {
          let prerelease = [identifier, base];
          if (identifierBase === false) {
            prerelease = [identifier];
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease;
            }
          } else {
            this.prerelease = prerelease;
          }
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${release}`);
    }
    this.raw = this.format();
    if (this.build.length) {
      this.raw += `+${this.build.join(".")}`;
    }
    return this;
  }
};
var semver = SemVer$3;
const SemVer$2 = semver;
const parse$1 = (version2, options, throwErrors = false) => {
  if (version2 instanceof SemVer$2) {
    return version2;
  }
  try {
    return new SemVer$2(version2, options);
  } catch (er) {
    if (!throwErrors) {
      return null;
    }
    throw er;
  }
};
var parse_1 = parse$1;
const SemVer$1 = semver;
const parse = parse_1;
const { safeRe: re, t } = reExports;
const coerce = (version2, options) => {
  if (version2 instanceof SemVer$1) {
    return version2;
  }
  if (typeof version2 === "number") {
    version2 = String(version2);
  }
  if (typeof version2 !== "string") {
    return null;
  }
  options = options || {};
  let match = null;
  if (!options.rtl) {
    match = version2.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  } else {
    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
    let next;
    while ((next = coerceRtlRegex.exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
      if (!match || next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
    }
    coerceRtlRegex.lastIndex = -1;
  }
  if (match === null) {
    return null;
  }
  const major = match[2];
  const minor = match[3] || "0";
  const patch = match[4] || "0";
  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
  const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
};
var coerce_1 = coerce;
const SemVer2 = semver;
const compare$6 = (a, b, loose) => new SemVer2(a, loose).compare(new SemVer2(b, loose));
var compare_1 = compare$6;
const compare$5 = compare_1;
const gte$1 = (a, b, loose) => compare$5(a, b, loose) >= 0;
var gte_1 = gte$1;
class LRUCache {
  constructor() {
    this.max = 1e3;
    this.map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      return void 0;
    } else {
      this.map.delete(key);
      this.map.set(key, value);
      return value;
    }
  }
  delete(key) {
    return this.map.delete(key);
  }
  set(key, value) {
    const deleted = this.delete(key);
    if (!deleted && value !== void 0) {
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value;
        this.delete(firstKey);
      }
      this.map.set(key, value);
    }
    return this;
  }
}
var lrucache = LRUCache;
const compare$4 = compare_1;
const eq$1 = (a, b, loose) => compare$4(a, b, loose) === 0;
var eq_1 = eq$1;
const compare$3 = compare_1;
const neq$1 = (a, b, loose) => compare$3(a, b, loose) !== 0;
var neq_1 = neq$1;
const compare$2 = compare_1;
const gt$1 = (a, b, loose) => compare$2(a, b, loose) > 0;
var gt_1 = gt$1;
const compare$1 = compare_1;
const lt$1 = (a, b, loose) => compare$1(a, b, loose) < 0;
var lt_1 = lt$1;
const compare = compare_1;
const lte$1 = (a, b, loose) => compare(a, b, loose) <= 0;
var lte_1 = lte$1;
const eq = eq_1;
const neq = neq_1;
const gt = gt_1;
const gte = gte_1;
const lt = lt_1;
const lte = lte_1;
const cmp = (a, op, b, loose) => {
  switch (op) {
    case "===":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a === b;
    case "!==":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a !== b;
    case "":
    case "=":
    case "==":
      return eq(a, b, loose);
    case "!=":
      return neq(a, b, loose);
    case ">":
      return gt(a, b, loose);
    case ">=":
      return gte(a, b, loose);
    case "<":
      return lt(a, b, loose);
    case "<=":
      return lte(a, b, loose);
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};
var cmp_1 = cmp;
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY = Symbol("SemVer ANY");
  class Comparator {
    static get ANY() {
      return ANY;
    }
    constructor(comp, options) {
      options = parseOptions2(options);
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug2("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t2.COMPARATORLOOSE] : re2[t2.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer3(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version2) {
      debug2("Comparator.test", version2, this.options.loose);
      if (this.semver === ANY || version2 === ANY) {
        return true;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp2(version2, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range2(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range2(this.value, options).test(comp.semver);
      }
      options = parseOptions2(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp2(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp2(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
  comparator = Comparator;
  const parseOptions2 = parseOptions_1;
  const { safeRe: re2, t: t2 } = reExports;
  const cmp2 = cmp_1;
  const debug2 = debug_1;
  const SemVer3 = semver;
  const Range2 = requireRange();
  return comparator;
}
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range2 {
    constructor(range2, options) {
      options = parseOptions2(options);
      if (range2 instanceof Range2) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range2(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i = 0; i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(range2) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache2.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t2.HYPHENRANGELOOSE] : re2[t2.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug2("hyphen replace", range2);
      range2 = range2.replace(re2[t2.COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range2);
      range2 = range2.replace(re2[t2.TILDETRIM], tildeTrimReplace);
      debug2("tilde trim", range2);
      range2 = range2.replace(re2[t2.CARETTRIM], caretTrimReplace);
      debug2("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug2("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t2.COMPARATORLOOSE]);
        });
      }
      debug2("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache2.set(memoKey, result);
      return result;
    }
    intersects(range2, options) {
      if (!(range2 instanceof Range2)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version2) {
      if (!version2) {
        return false;
      }
      if (typeof version2 === "string") {
        try {
          version2 = new SemVer3(version2, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version2, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
  range = Range2;
  const LRU = lrucache;
  const cache2 = new LRU();
  const parseOptions2 = parseOptions_1;
  const Comparator = requireComparator();
  const debug2 = debug_1;
  const SemVer3 = semver;
  const {
    safeRe: re2,
    t: t2,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = reExports;
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants;
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
    }
    return result;
  };
  const parseComparator = (comp, options) => {
    debug2("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug2("caret", comp);
    comp = replaceTildes(comp, options);
    debug2("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug2("xrange", comp);
    comp = replaceStars(comp, options);
    debug2("stars", comp);
    return comp;
  };
  const isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
  const replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t2.TILDELOOSE] : re2[t2.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug2("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
      }
      debug2("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  const replaceCaret = (comp, options) => {
    debug2("caret", comp, options);
    const r = options.loose ? re2[t2.CARETLOOSE] : re2[t2.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug2("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug2("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug2("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug2("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t2.XRANGELOOSE] : re2[t2.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug2("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug2("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug2("replaceStars", comp, options);
    return comp.trim().replace(re2[t2.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug2("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t2.GTE0PRE : t2.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set, version2, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version2)) {
        return false;
      }
    }
    if (version2.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug2(set[i].semver);
        if (set[i].semver === Comparator.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
const Range = requireRange();
const satisfies = (version2, range2, options) => {
  try {
    range2 = new Range(range2, options);
  } catch (er) {
    return false;
  }
  return range2.test(version2);
};
var satisfies_1 = satisfies;
const version = "0.34.4";
const engines$1 = {
  node: "^18.17.0 || ^20.3.0 || >=21.0.0"
};
const config$1 = {
  libvips: ">=8.17.2"
};
const require$$6 = {
  version,
  engines: engines$1,
  config: config$1
};
const { spawnSync } = require$$0$4;
const { createHash } = require$$1$2;
const semverCoerce = coerce_1;
const semverSatisfies = satisfies_1;
const detectLibc$1 = detectLibc$2;
const { config, engines } = require$$6;
const minimumLibvipsVersionLabelled = process.env.npm_package_config_libvips || /* istanbul ignore next */
config.libvips;
const minimumLibvipsVersion$1 = semverCoerce(minimumLibvipsVersionLabelled).version;
const prebuiltPlatforms$1 = [
  "darwin-arm64",
  "darwin-x64",
  "linux-arm",
  "linux-arm64",
  "linux-ppc64",
  "linux-s390x",
  "linux-x64",
  "linuxmusl-arm64",
  "linuxmusl-x64",
  "win32-arm64",
  "win32-ia32",
  "win32-x64"
];
const runtimeLibc = () => detectLibc$1.isNonGlibcLinuxSync() ? detectLibc$1.familySync() : "";
const runtimePlatformArch$2 = () => `${process.platform}${runtimeLibc()}-${process.arch}`;
const isUnsupportedNodeRuntime$1 = () => {
  var _a;
  if (((_a = process.release) == null ? void 0 : _a.name) === "node" && process.versions) {
    if (!semverSatisfies(process.versions.node, engines.node)) {
      return { found: process.versions.node, expected: engines.node };
    }
  }
};
var libvips = {
  minimumLibvipsVersion: minimumLibvipsVersion$1,
  prebuiltPlatforms: prebuiltPlatforms$1,
  isUnsupportedNodeRuntime: isUnsupportedNodeRuntime$1,
  runtimePlatformArch: runtimePlatformArch$2
};
const { familySync, versionSync } = detectLibc$2;
const { runtimePlatformArch: runtimePlatformArch$1, isUnsupportedNodeRuntime, prebuiltPlatforms, minimumLibvipsVersion } = libvips;
const runtimePlatform$1 = runtimePlatformArch$1();
const paths = [
  `../src/build/Release/sharp-${runtimePlatform$1}.node`,
  "../src/build/Release/sharp-wasm32.node",
  `@img/sharp-${runtimePlatform$1}/sharp.node`,
  "@img/sharp-wasm32/sharp.node"
];
let path$1, sharp$4;
const errors = [];
for (path$1 of paths) {
  try {
    sharp$4 = commonjsRequire(path$1);
    break;
  } catch (err) {
    errors.push(err);
  }
}
if (sharp$4 && path$1.startsWith("@img/sharp-linux-x64") && !sharp$4._isUsingX64V2()) {
  const err = new Error("Prebuilt binaries for linux-x64 require v2 microarchitecture");
  err.code = "Unsupported CPU";
  errors.push(err);
  sharp$4 = null;
}
if (sharp$4) {
  sharp$5.exports = sharp$4;
} else {
  const [isLinux2, isMacOs, isWindows2] = ["linux", "darwin", "win32"].map((os2) => runtimePlatform$1.startsWith(os2));
  const help = [`Could not load the "sharp" module using the ${runtimePlatform$1} runtime`];
  errors.forEach((err) => {
    if (err.code !== "MODULE_NOT_FOUND") {
      help.push(`${err.code}: ${err.message}`);
    }
  });
  const messages = errors.map((err) => err.message).join(" ");
  help.push("Possible solutions:");
  if (isUnsupportedNodeRuntime()) {
    const { found, expected } = isUnsupportedNodeRuntime();
    help.push(
      "- Please upgrade Node.js:",
      `    Found ${found}`,
      `    Requires ${expected}`
    );
  } else if (prebuiltPlatforms.includes(runtimePlatform$1)) {
    const [os2, cpu] = runtimePlatform$1.split("-");
    const libc = os2.endsWith("musl") ? " --libc=musl" : "";
    help.push(
      "- Ensure optional dependencies can be installed:",
      "    npm install --include=optional sharp",
      "- Ensure your package manager supports multi-platform installation:",
      "    See https://sharp.pixelplumbing.com/install#cross-platform",
      "- Add platform-specific dependencies:",
      `    npm install --os=${os2.replace("musl", "")}${libc} --cpu=${cpu} sharp`
    );
  } else {
    help.push(
      `- Manually install libvips >= ${minimumLibvipsVersion}`,
      "- Add experimental WebAssembly-based dependencies:",
      "    npm install --cpu=wasm32 sharp",
      "    npm install @img/sharp-wasm32"
    );
  }
  if (isLinux2 && /(symbol not found|CXXABI_)/i.test(messages)) {
    try {
      const { config: config2 } = commonjsRequire(`@img/sharp-libvips-${runtimePlatform$1}/package`);
      const libcFound = `${familySync()} ${versionSync()}`;
      const libcRequires = `${config2.musl ? "musl" : "glibc"} ${config2.musl || config2.glibc}`;
      help.push(
        "- Update your OS:",
        `    Found ${libcFound}`,
        `    Requires ${libcRequires}`
      );
    } catch (errEngines) {
    }
  }
  if (isLinux2 && /\/snap\/core[0-9]{2}/.test(messages)) {
    help.push(
      "- Remove the Node.js Snap, which does not support native modules",
      "    snap remove node"
    );
  }
  if (isMacOs && /Incompatible library version/.test(messages)) {
    help.push(
      "- Update Homebrew:",
      "    brew update && brew upgrade vips"
    );
  }
  if (errors.some((err) => err.code === "ERR_DLOPEN_DISABLED")) {
    help.push("- Run Node.js without using the --no-addons flag");
  }
  if (isWindows2 && /The specified procedure could not be found/.test(messages)) {
    help.push(
      "- Using the canvas package on Windows?",
      "    See https://sharp.pixelplumbing.com/install#canvas-and-windows",
      "- Check for outdated versions of sharp in the dependency tree:",
      "    npm ls sharp"
    );
  }
  help.push(
    "- Consult the installation documentation:",
    "    See https://sharp.pixelplumbing.com/install"
  );
  throw new Error(help.join("\n"));
}
var sharpExports = sharp$5.exports;
const util = require$$0$5;
const stream = require$$1$3;
const is$8 = is$9;
const debuglog = util.debuglog("sharp");
const Sharp$1 = function(input2, options) {
  if (arguments.length === 1 && !is$8.defined(input2)) {
    throw new Error("Invalid input");
  }
  if (!(this instanceof Sharp$1)) {
    return new Sharp$1(input2, options);
  }
  stream.Duplex.call(this);
  this.options = {
    // resize options
    topOffsetPre: -1,
    leftOffsetPre: -1,
    widthPre: -1,
    heightPre: -1,
    topOffsetPost: -1,
    leftOffsetPost: -1,
    widthPost: -1,
    heightPost: -1,
    width: -1,
    height: -1,
    canvas: "crop",
    position: 0,
    resizeBackground: [0, 0, 0, 255],
    angle: 0,
    rotationAngle: 0,
    rotationBackground: [0, 0, 0, 255],
    rotateBefore: false,
    orientBefore: false,
    flip: false,
    flop: false,
    extendTop: 0,
    extendBottom: 0,
    extendLeft: 0,
    extendRight: 0,
    extendBackground: [0, 0, 0, 255],
    extendWith: "background",
    withoutEnlargement: false,
    withoutReduction: false,
    affineMatrix: [],
    affineBackground: [0, 0, 0, 255],
    affineIdx: 0,
    affineIdy: 0,
    affineOdx: 0,
    affineOdy: 0,
    affineInterpolator: this.constructor.interpolators.bilinear,
    kernel: "lanczos3",
    fastShrinkOnLoad: true,
    // operations
    tint: [-1, 0, 0, 0],
    flatten: false,
    flattenBackground: [0, 0, 0],
    unflatten: false,
    negate: false,
    negateAlpha: true,
    medianSize: 0,
    blurSigma: 0,
    precision: "integer",
    minAmpl: 0.2,
    sharpenSigma: 0,
    sharpenM1: 1,
    sharpenM2: 2,
    sharpenX1: 2,
    sharpenY2: 10,
    sharpenY3: 20,
    threshold: 0,
    thresholdGrayscale: true,
    trimBackground: [],
    trimThreshold: -1,
    trimLineArt: false,
    dilateWidth: 0,
    erodeWidth: 0,
    gamma: 0,
    gammaOut: 0,
    greyscale: false,
    normalise: false,
    normaliseLower: 1,
    normaliseUpper: 99,
    claheWidth: 0,
    claheHeight: 0,
    claheMaxSlope: 3,
    brightness: 1,
    saturation: 1,
    hue: 0,
    lightness: 0,
    booleanBufferIn: null,
    booleanFileIn: "",
    joinChannelIn: [],
    extractChannel: -1,
    removeAlpha: false,
    ensureAlpha: -1,
    colourspace: "srgb",
    colourspacePipeline: "last",
    composite: [],
    // output
    fileOut: "",
    formatOut: "input",
    streamOut: false,
    keepMetadata: 0,
    withMetadataOrientation: -1,
    withMetadataDensity: 0,
    withIccProfile: "",
    withExif: {},
    withExifMerge: true,
    withXmp: "",
    resolveWithObject: false,
    loop: -1,
    delay: [],
    // output format
    jpegQuality: 80,
    jpegProgressive: false,
    jpegChromaSubsampling: "4:2:0",
    jpegTrellisQuantisation: false,
    jpegOvershootDeringing: false,
    jpegOptimiseScans: false,
    jpegOptimiseCoding: true,
    jpegQuantisationTable: 0,
    pngProgressive: false,
    pngCompressionLevel: 6,
    pngAdaptiveFiltering: false,
    pngPalette: false,
    pngQuality: 100,
    pngEffort: 7,
    pngBitdepth: 8,
    pngDither: 1,
    jp2Quality: 80,
    jp2TileHeight: 512,
    jp2TileWidth: 512,
    jp2Lossless: false,
    jp2ChromaSubsampling: "4:4:4",
    webpQuality: 80,
    webpAlphaQuality: 100,
    webpLossless: false,
    webpNearLossless: false,
    webpSmartSubsample: false,
    webpSmartDeblock: false,
    webpPreset: "default",
    webpEffort: 4,
    webpMinSize: false,
    webpMixed: false,
    gifBitdepth: 8,
    gifEffort: 7,
    gifDither: 1,
    gifInterFrameMaxError: 0,
    gifInterPaletteMaxError: 3,
    gifKeepDuplicateFrames: false,
    gifReuse: true,
    gifProgressive: false,
    tiffQuality: 80,
    tiffCompression: "jpeg",
    tiffPredictor: "horizontal",
    tiffPyramid: false,
    tiffMiniswhite: false,
    tiffBitdepth: 8,
    tiffTile: false,
    tiffTileHeight: 256,
    tiffTileWidth: 256,
    tiffXres: 1,
    tiffYres: 1,
    tiffResolutionUnit: "inch",
    heifQuality: 50,
    heifLossless: false,
    heifCompression: "av1",
    heifEffort: 4,
    heifChromaSubsampling: "4:4:4",
    heifBitdepth: 8,
    jxlDistance: 1,
    jxlDecodingTier: 0,
    jxlEffort: 7,
    jxlLossless: false,
    rawDepth: "uchar",
    tileSize: 256,
    tileOverlap: 0,
    tileContainer: "fs",
    tileLayout: "dz",
    tileFormat: "last",
    tileDepth: "last",
    tileAngle: 0,
    tileSkipBlanks: -1,
    tileBackground: [255, 255, 255, 255],
    tileCentre: false,
    tileId: "https://example.com/iiif",
    tileBasename: "",
    timeoutSeconds: 0,
    linearA: [],
    linearB: [],
    pdfBackground: [255, 255, 255, 255],
    // Function to notify of libvips warnings
    debuglog: (warning) => {
      this.emit("warning", warning);
      debuglog(warning);
    },
    // Function to notify of queue length changes
    queueListener: function(queueLength) {
      Sharp$1.queue.emit("change", queueLength);
    }
  };
  this.options.input = this._createInputDescriptor(input2, options, { allowStream: true });
  return this;
};
Object.setPrototypeOf(Sharp$1.prototype, stream.Duplex.prototype);
Object.setPrototypeOf(Sharp$1, stream.Duplex);
function clone() {
  const clone2 = this.constructor.call();
  const { debuglog: debuglog2, queueListener, ...options } = this.options;
  clone2.options = structuredClone(options);
  clone2.options.debuglog = debuglog2;
  clone2.options.queueListener = queueListener;
  if (this._isStreamInput()) {
    this.on("finish", () => {
      this._flattenBufferIn();
      clone2.options.input.buffer = this.options.input.buffer;
      clone2.emit("finish");
    });
  }
  return clone2;
}
Object.assign(Sharp$1.prototype, { clone });
var constructor = Sharp$1;
const is$7 = is$9;
const sharp$3 = sharpExports;
const align = {
  left: "low",
  top: "low",
  low: "low",
  center: "centre",
  centre: "centre",
  right: "high",
  bottom: "high",
  high: "high"
};
const inputStreamParameters = [
  // Limits and error handling
  "failOn",
  "limitInputPixels",
  "unlimited",
  // Format-generic
  "animated",
  "autoOrient",
  "density",
  "ignoreIcc",
  "page",
  "pages",
  "sequentialRead",
  // Format-specific
  "jp2",
  "openSlide",
  "pdf",
  "raw",
  "svg",
  "tiff",
  // Deprecated
  "failOnError",
  "openSlideLevel",
  "pdfBackground",
  "tiffSubifd"
];
function _inputOptionsFromObject(obj) {
  const params = inputStreamParameters.filter((p) => is$7.defined(obj[p])).map((p) => [p, obj[p]]);
  return params.length ? Object.fromEntries(params) : void 0;
}
function _createInputDescriptor(input2, inputOptions, containerOptions) {
  const inputDescriptor = {
    autoOrient: false,
    failOn: "warning",
    limitInputPixels: Math.pow(16383, 2),
    ignoreIcc: false,
    unlimited: false,
    sequentialRead: true
  };
  if (is$7.string(input2)) {
    inputDescriptor.file = input2;
  } else if (is$7.buffer(input2)) {
    if (input2.length === 0) {
      throw Error("Input Buffer is empty");
    }
    inputDescriptor.buffer = input2;
  } else if (is$7.arrayBuffer(input2)) {
    if (input2.byteLength === 0) {
      throw Error("Input bit Array is empty");
    }
    inputDescriptor.buffer = Buffer.from(input2, 0, input2.byteLength);
  } else if (is$7.typedArray(input2)) {
    if (input2.length === 0) {
      throw Error("Input Bit Array is empty");
    }
    inputDescriptor.buffer = Buffer.from(input2.buffer, input2.byteOffset, input2.byteLength);
  } else if (is$7.plainObject(input2) && !is$7.defined(inputOptions)) {
    inputOptions = input2;
    if (_inputOptionsFromObject(inputOptions)) {
      inputDescriptor.buffer = [];
    }
  } else if (!is$7.defined(input2) && !is$7.defined(inputOptions) && is$7.object(containerOptions) && containerOptions.allowStream) {
    inputDescriptor.buffer = [];
  } else if (Array.isArray(input2)) {
    if (input2.length > 1) {
      if (!this.options.joining) {
        this.options.joining = true;
        this.options.join = input2.map((i) => this._createInputDescriptor(i));
      } else {
        throw new Error("Recursive join is unsupported");
      }
    } else {
      throw new Error("Expected at least two images to join");
    }
  } else {
    throw new Error(`Unsupported input '${input2}' of type ${typeof input2}${is$7.defined(inputOptions) ? ` when also providing options of type ${typeof inputOptions}` : ""}`);
  }
  if (is$7.object(inputOptions)) {
    if (is$7.defined(inputOptions.failOnError)) {
      if (is$7.bool(inputOptions.failOnError)) {
        inputDescriptor.failOn = inputOptions.failOnError ? "warning" : "none";
      } else {
        throw is$7.invalidParameterError("failOnError", "boolean", inputOptions.failOnError);
      }
    }
    if (is$7.defined(inputOptions.failOn)) {
      if (is$7.string(inputOptions.failOn) && is$7.inArray(inputOptions.failOn, ["none", "truncated", "error", "warning"])) {
        inputDescriptor.failOn = inputOptions.failOn;
      } else {
        throw is$7.invalidParameterError("failOn", "one of: none, truncated, error, warning", inputOptions.failOn);
      }
    }
    if (is$7.defined(inputOptions.autoOrient)) {
      if (is$7.bool(inputOptions.autoOrient)) {
        inputDescriptor.autoOrient = inputOptions.autoOrient;
      } else {
        throw is$7.invalidParameterError("autoOrient", "boolean", inputOptions.autoOrient);
      }
    }
    if (is$7.defined(inputOptions.density)) {
      if (is$7.inRange(inputOptions.density, 1, 1e5)) {
        inputDescriptor.density = inputOptions.density;
      } else {
        throw is$7.invalidParameterError("density", "number between 1 and 100000", inputOptions.density);
      }
    }
    if (is$7.defined(inputOptions.ignoreIcc)) {
      if (is$7.bool(inputOptions.ignoreIcc)) {
        inputDescriptor.ignoreIcc = inputOptions.ignoreIcc;
      } else {
        throw is$7.invalidParameterError("ignoreIcc", "boolean", inputOptions.ignoreIcc);
      }
    }
    if (is$7.defined(inputOptions.limitInputPixels)) {
      if (is$7.bool(inputOptions.limitInputPixels)) {
        inputDescriptor.limitInputPixels = inputOptions.limitInputPixels ? Math.pow(16383, 2) : 0;
      } else if (is$7.integer(inputOptions.limitInputPixels) && is$7.inRange(inputOptions.limitInputPixels, 0, Number.MAX_SAFE_INTEGER)) {
        inputDescriptor.limitInputPixels = inputOptions.limitInputPixels;
      } else {
        throw is$7.invalidParameterError("limitInputPixels", "positive integer", inputOptions.limitInputPixels);
      }
    }
    if (is$7.defined(inputOptions.unlimited)) {
      if (is$7.bool(inputOptions.unlimited)) {
        inputDescriptor.unlimited = inputOptions.unlimited;
      } else {
        throw is$7.invalidParameterError("unlimited", "boolean", inputOptions.unlimited);
      }
    }
    if (is$7.defined(inputOptions.sequentialRead)) {
      if (is$7.bool(inputOptions.sequentialRead)) {
        inputDescriptor.sequentialRead = inputOptions.sequentialRead;
      } else {
        throw is$7.invalidParameterError("sequentialRead", "boolean", inputOptions.sequentialRead);
      }
    }
    if (is$7.defined(inputOptions.raw)) {
      if (is$7.object(inputOptions.raw) && is$7.integer(inputOptions.raw.width) && inputOptions.raw.width > 0 && is$7.integer(inputOptions.raw.height) && inputOptions.raw.height > 0 && is$7.integer(inputOptions.raw.channels) && is$7.inRange(inputOptions.raw.channels, 1, 4)) {
        inputDescriptor.rawWidth = inputOptions.raw.width;
        inputDescriptor.rawHeight = inputOptions.raw.height;
        inputDescriptor.rawChannels = inputOptions.raw.channels;
        switch (input2.constructor) {
          case Uint8Array:
          case Uint8ClampedArray:
            inputDescriptor.rawDepth = "uchar";
            break;
          case Int8Array:
            inputDescriptor.rawDepth = "char";
            break;
          case Uint16Array:
            inputDescriptor.rawDepth = "ushort";
            break;
          case Int16Array:
            inputDescriptor.rawDepth = "short";
            break;
          case Uint32Array:
            inputDescriptor.rawDepth = "uint";
            break;
          case Int32Array:
            inputDescriptor.rawDepth = "int";
            break;
          case Float32Array:
            inputDescriptor.rawDepth = "float";
            break;
          case Float64Array:
            inputDescriptor.rawDepth = "double";
            break;
          default:
            inputDescriptor.rawDepth = "uchar";
            break;
        }
      } else {
        throw new Error("Expected width, height and channels for raw pixel input");
      }
      inputDescriptor.rawPremultiplied = false;
      if (is$7.defined(inputOptions.raw.premultiplied)) {
        if (is$7.bool(inputOptions.raw.premultiplied)) {
          inputDescriptor.rawPremultiplied = inputOptions.raw.premultiplied;
        } else {
          throw is$7.invalidParameterError("raw.premultiplied", "boolean", inputOptions.raw.premultiplied);
        }
      }
      inputDescriptor.rawPageHeight = 0;
      if (is$7.defined(inputOptions.raw.pageHeight)) {
        if (is$7.integer(inputOptions.raw.pageHeight) && inputOptions.raw.pageHeight > 0 && inputOptions.raw.pageHeight <= inputOptions.raw.height) {
          if (inputOptions.raw.height % inputOptions.raw.pageHeight !== 0) {
            throw new Error(`Expected raw.height ${inputOptions.raw.height} to be a multiple of raw.pageHeight ${inputOptions.raw.pageHeight}`);
          }
          inputDescriptor.rawPageHeight = inputOptions.raw.pageHeight;
        } else {
          throw is$7.invalidParameterError("raw.pageHeight", "positive integer", inputOptions.raw.pageHeight);
        }
      }
    }
    if (is$7.defined(inputOptions.animated)) {
      if (is$7.bool(inputOptions.animated)) {
        inputDescriptor.pages = inputOptions.animated ? -1 : 1;
      } else {
        throw is$7.invalidParameterError("animated", "boolean", inputOptions.animated);
      }
    }
    if (is$7.defined(inputOptions.pages)) {
      if (is$7.integer(inputOptions.pages) && is$7.inRange(inputOptions.pages, -1, 1e5)) {
        inputDescriptor.pages = inputOptions.pages;
      } else {
        throw is$7.invalidParameterError("pages", "integer between -1 and 100000", inputOptions.pages);
      }
    }
    if (is$7.defined(inputOptions.page)) {
      if (is$7.integer(inputOptions.page) && is$7.inRange(inputOptions.page, 0, 1e5)) {
        inputDescriptor.page = inputOptions.page;
      } else {
        throw is$7.invalidParameterError("page", "integer between 0 and 100000", inputOptions.page);
      }
    }
    if (is$7.object(inputOptions.openSlide) && is$7.defined(inputOptions.openSlide.level)) {
      if (is$7.integer(inputOptions.openSlide.level) && is$7.inRange(inputOptions.openSlide.level, 0, 256)) {
        inputDescriptor.openSlideLevel = inputOptions.openSlide.level;
      } else {
        throw is$7.invalidParameterError("openSlide.level", "integer between 0 and 256", inputOptions.openSlide.level);
      }
    } else if (is$7.defined(inputOptions.level)) {
      if (is$7.integer(inputOptions.level) && is$7.inRange(inputOptions.level, 0, 256)) {
        inputDescriptor.openSlideLevel = inputOptions.level;
      } else {
        throw is$7.invalidParameterError("level", "integer between 0 and 256", inputOptions.level);
      }
    }
    if (is$7.object(inputOptions.tiff) && is$7.defined(inputOptions.tiff.subifd)) {
      if (is$7.integer(inputOptions.tiff.subifd) && is$7.inRange(inputOptions.tiff.subifd, -1, 1e5)) {
        inputDescriptor.tiffSubifd = inputOptions.tiff.subifd;
      } else {
        throw is$7.invalidParameterError("tiff.subifd", "integer between -1 and 100000", inputOptions.tiff.subifd);
      }
    } else if (is$7.defined(inputOptions.subifd)) {
      if (is$7.integer(inputOptions.subifd) && is$7.inRange(inputOptions.subifd, -1, 1e5)) {
        inputDescriptor.tiffSubifd = inputOptions.subifd;
      } else {
        throw is$7.invalidParameterError("subifd", "integer between -1 and 100000", inputOptions.subifd);
      }
    }
    if (is$7.object(inputOptions.svg)) {
      if (is$7.defined(inputOptions.svg.stylesheet)) {
        if (is$7.string(inputOptions.svg.stylesheet)) {
          inputDescriptor.svgStylesheet = inputOptions.svg.stylesheet;
        } else {
          throw is$7.invalidParameterError("svg.stylesheet", "string", inputOptions.svg.stylesheet);
        }
      }
      if (is$7.defined(inputOptions.svg.highBitdepth)) {
        if (is$7.bool(inputOptions.svg.highBitdepth)) {
          inputDescriptor.svgHighBitdepth = inputOptions.svg.highBitdepth;
        } else {
          throw is$7.invalidParameterError("svg.highBitdepth", "boolean", inputOptions.svg.highBitdepth);
        }
      }
    }
    if (is$7.object(inputOptions.pdf) && is$7.defined(inputOptions.pdf.background)) {
      inputDescriptor.pdfBackground = this._getBackgroundColourOption(inputOptions.pdf.background);
    } else if (is$7.defined(inputOptions.pdfBackground)) {
      inputDescriptor.pdfBackground = this._getBackgroundColourOption(inputOptions.pdfBackground);
    }
    if (is$7.object(inputOptions.jp2) && is$7.defined(inputOptions.jp2.oneshot)) {
      if (is$7.bool(inputOptions.jp2.oneshot)) {
        inputDescriptor.jp2Oneshot = inputOptions.jp2.oneshot;
      } else {
        throw is$7.invalidParameterError("jp2.oneshot", "boolean", inputOptions.jp2.oneshot);
      }
    }
    if (is$7.defined(inputOptions.create)) {
      if (is$7.object(inputOptions.create) && is$7.integer(inputOptions.create.width) && inputOptions.create.width > 0 && is$7.integer(inputOptions.create.height) && inputOptions.create.height > 0 && is$7.integer(inputOptions.create.channels)) {
        inputDescriptor.createWidth = inputOptions.create.width;
        inputDescriptor.createHeight = inputOptions.create.height;
        inputDescriptor.createChannels = inputOptions.create.channels;
        inputDescriptor.createPageHeight = 0;
        if (is$7.defined(inputOptions.create.pageHeight)) {
          if (is$7.integer(inputOptions.create.pageHeight) && inputOptions.create.pageHeight > 0 && inputOptions.create.pageHeight <= inputOptions.create.height) {
            if (inputOptions.create.height % inputOptions.create.pageHeight !== 0) {
              throw new Error(`Expected create.height ${inputOptions.create.height} to be a multiple of create.pageHeight ${inputOptions.create.pageHeight}`);
            }
            inputDescriptor.createPageHeight = inputOptions.create.pageHeight;
          } else {
            throw is$7.invalidParameterError("create.pageHeight", "positive integer", inputOptions.create.pageHeight);
          }
        }
        if (is$7.defined(inputOptions.create.noise)) {
          if (!is$7.object(inputOptions.create.noise)) {
            throw new Error("Expected noise to be an object");
          }
          if (inputOptions.create.noise.type !== "gaussian") {
            throw new Error("Only gaussian noise is supported at the moment");
          }
          inputDescriptor.createNoiseType = inputOptions.create.noise.type;
          if (!is$7.inRange(inputOptions.create.channels, 1, 4)) {
            throw is$7.invalidParameterError("create.channels", "number between 1 and 4", inputOptions.create.channels);
          }
          inputDescriptor.createNoiseMean = 128;
          if (is$7.defined(inputOptions.create.noise.mean)) {
            if (is$7.number(inputOptions.create.noise.mean) && is$7.inRange(inputOptions.create.noise.mean, 0, 1e4)) {
              inputDescriptor.createNoiseMean = inputOptions.create.noise.mean;
            } else {
              throw is$7.invalidParameterError("create.noise.mean", "number between 0 and 10000", inputOptions.create.noise.mean);
            }
          }
          inputDescriptor.createNoiseSigma = 30;
          if (is$7.defined(inputOptions.create.noise.sigma)) {
            if (is$7.number(inputOptions.create.noise.sigma) && is$7.inRange(inputOptions.create.noise.sigma, 0, 1e4)) {
              inputDescriptor.createNoiseSigma = inputOptions.create.noise.sigma;
            } else {
              throw is$7.invalidParameterError("create.noise.sigma", "number between 0 and 10000", inputOptions.create.noise.sigma);
            }
          }
        } else if (is$7.defined(inputOptions.create.background)) {
          if (!is$7.inRange(inputOptions.create.channels, 3, 4)) {
            throw is$7.invalidParameterError("create.channels", "number between 3 and 4", inputOptions.create.channels);
          }
          inputDescriptor.createBackground = this._getBackgroundColourOption(inputOptions.create.background);
        } else {
          throw new Error("Expected valid noise or background to create a new input image");
        }
        delete inputDescriptor.buffer;
      } else {
        throw new Error("Expected valid width, height and channels to create a new input image");
      }
    }
    if (is$7.defined(inputOptions.text)) {
      if (is$7.object(inputOptions.text) && is$7.string(inputOptions.text.text)) {
        inputDescriptor.textValue = inputOptions.text.text;
        if (is$7.defined(inputOptions.text.height) && is$7.defined(inputOptions.text.dpi)) {
          throw new Error("Expected only one of dpi or height");
        }
        if (is$7.defined(inputOptions.text.font)) {
          if (is$7.string(inputOptions.text.font)) {
            inputDescriptor.textFont = inputOptions.text.font;
          } else {
            throw is$7.invalidParameterError("text.font", "string", inputOptions.text.font);
          }
        }
        if (is$7.defined(inputOptions.text.fontfile)) {
          if (is$7.string(inputOptions.text.fontfile)) {
            inputDescriptor.textFontfile = inputOptions.text.fontfile;
          } else {
            throw is$7.invalidParameterError("text.fontfile", "string", inputOptions.text.fontfile);
          }
        }
        if (is$7.defined(inputOptions.text.width)) {
          if (is$7.integer(inputOptions.text.width) && inputOptions.text.width > 0) {
            inputDescriptor.textWidth = inputOptions.text.width;
          } else {
            throw is$7.invalidParameterError("text.width", "positive integer", inputOptions.text.width);
          }
        }
        if (is$7.defined(inputOptions.text.height)) {
          if (is$7.integer(inputOptions.text.height) && inputOptions.text.height > 0) {
            inputDescriptor.textHeight = inputOptions.text.height;
          } else {
            throw is$7.invalidParameterError("text.height", "positive integer", inputOptions.text.height);
          }
        }
        if (is$7.defined(inputOptions.text.align)) {
          if (is$7.string(inputOptions.text.align) && is$7.string(this.constructor.align[inputOptions.text.align])) {
            inputDescriptor.textAlign = this.constructor.align[inputOptions.text.align];
          } else {
            throw is$7.invalidParameterError("text.align", "valid alignment", inputOptions.text.align);
          }
        }
        if (is$7.defined(inputOptions.text.justify)) {
          if (is$7.bool(inputOptions.text.justify)) {
            inputDescriptor.textJustify = inputOptions.text.justify;
          } else {
            throw is$7.invalidParameterError("text.justify", "boolean", inputOptions.text.justify);
          }
        }
        if (is$7.defined(inputOptions.text.dpi)) {
          if (is$7.integer(inputOptions.text.dpi) && is$7.inRange(inputOptions.text.dpi, 1, 1e6)) {
            inputDescriptor.textDpi = inputOptions.text.dpi;
          } else {
            throw is$7.invalidParameterError("text.dpi", "integer between 1 and 1000000", inputOptions.text.dpi);
          }
        }
        if (is$7.defined(inputOptions.text.rgba)) {
          if (is$7.bool(inputOptions.text.rgba)) {
            inputDescriptor.textRgba = inputOptions.text.rgba;
          } else {
            throw is$7.invalidParameterError("text.rgba", "bool", inputOptions.text.rgba);
          }
        }
        if (is$7.defined(inputOptions.text.spacing)) {
          if (is$7.integer(inputOptions.text.spacing) && is$7.inRange(inputOptions.text.spacing, -1e6, 1e6)) {
            inputDescriptor.textSpacing = inputOptions.text.spacing;
          } else {
            throw is$7.invalidParameterError("text.spacing", "integer between -1000000 and 1000000", inputOptions.text.spacing);
          }
        }
        if (is$7.defined(inputOptions.text.wrap)) {
          if (is$7.string(inputOptions.text.wrap) && is$7.inArray(inputOptions.text.wrap, ["word", "char", "word-char", "none"])) {
            inputDescriptor.textWrap = inputOptions.text.wrap;
          } else {
            throw is$7.invalidParameterError("text.wrap", "one of: word, char, word-char, none", inputOptions.text.wrap);
          }
        }
        delete inputDescriptor.buffer;
      } else {
        throw new Error("Expected a valid string to create an image with text.");
      }
    }
    if (is$7.defined(inputOptions.join)) {
      if (is$7.defined(this.options.join)) {
        if (is$7.defined(inputOptions.join.animated)) {
          if (is$7.bool(inputOptions.join.animated)) {
            inputDescriptor.joinAnimated = inputOptions.join.animated;
          } else {
            throw is$7.invalidParameterError("join.animated", "boolean", inputOptions.join.animated);
          }
        }
        if (is$7.defined(inputOptions.join.across)) {
          if (is$7.integer(inputOptions.join.across) && is$7.inRange(inputOptions.join.across, 1, 1e6)) {
            inputDescriptor.joinAcross = inputOptions.join.across;
          } else {
            throw is$7.invalidParameterError("join.across", "integer between 1 and 100000", inputOptions.join.across);
          }
        }
        if (is$7.defined(inputOptions.join.shim)) {
          if (is$7.integer(inputOptions.join.shim) && is$7.inRange(inputOptions.join.shim, 0, 1e6)) {
            inputDescriptor.joinShim = inputOptions.join.shim;
          } else {
            throw is$7.invalidParameterError("join.shim", "integer between 0 and 100000", inputOptions.join.shim);
          }
        }
        if (is$7.defined(inputOptions.join.background)) {
          inputDescriptor.joinBackground = this._getBackgroundColourOption(inputOptions.join.background);
        }
        if (is$7.defined(inputOptions.join.halign)) {
          if (is$7.string(inputOptions.join.halign) && is$7.string(this.constructor.align[inputOptions.join.halign])) {
            inputDescriptor.joinHalign = this.constructor.align[inputOptions.join.halign];
          } else {
            throw is$7.invalidParameterError("join.halign", "valid alignment", inputOptions.join.halign);
          }
        }
        if (is$7.defined(inputOptions.join.valign)) {
          if (is$7.string(inputOptions.join.valign) && is$7.string(this.constructor.align[inputOptions.join.valign])) {
            inputDescriptor.joinValign = this.constructor.align[inputOptions.join.valign];
          } else {
            throw is$7.invalidParameterError("join.valign", "valid alignment", inputOptions.join.valign);
          }
        }
      } else {
        throw new Error("Expected input to be an array of images to join");
      }
    }
  } else if (is$7.defined(inputOptions)) {
    throw new Error("Invalid input options " + inputOptions);
  }
  return inputDescriptor;
}
function _write(chunk, encoding, callback) {
  if (Array.isArray(this.options.input.buffer)) {
    if (is$7.buffer(chunk)) {
      if (this.options.input.buffer.length === 0) {
        this.on("finish", () => {
          this.streamInFinished = true;
        });
      }
      this.options.input.buffer.push(chunk);
      callback();
    } else {
      callback(new Error("Non-Buffer data on Writable Stream"));
    }
  } else {
    callback(new Error("Unexpected data on Writable Stream"));
  }
}
function _flattenBufferIn() {
  if (this._isStreamInput()) {
    this.options.input.buffer = Buffer.concat(this.options.input.buffer);
  }
}
function _isStreamInput() {
  return Array.isArray(this.options.input.buffer);
}
function metadata(callback) {
  const stack = Error();
  if (is$7.fn(callback)) {
    if (this._isStreamInput()) {
      this.on("finish", () => {
        this._flattenBufferIn();
        sharp$3.metadata(this.options, (err, metadata2) => {
          if (err) {
            callback(is$7.nativeError(err, stack));
          } else {
            callback(null, metadata2);
          }
        });
      });
    } else {
      sharp$3.metadata(this.options, (err, metadata2) => {
        if (err) {
          callback(is$7.nativeError(err, stack));
        } else {
          callback(null, metadata2);
        }
      });
    }
    return this;
  } else {
    if (this._isStreamInput()) {
      return new Promise((resolve, reject) => {
        const finished = () => {
          this._flattenBufferIn();
          sharp$3.metadata(this.options, (err, metadata2) => {
            if (err) {
              reject(is$7.nativeError(err, stack));
            } else {
              resolve(metadata2);
            }
          });
        };
        if (this.writableFinished) {
          finished();
        } else {
          this.once("finish", finished);
        }
      });
    } else {
      return new Promise((resolve, reject) => {
        sharp$3.metadata(this.options, (err, metadata2) => {
          if (err) {
            reject(is$7.nativeError(err, stack));
          } else {
            resolve(metadata2);
          }
        });
      });
    }
  }
}
function stats(callback) {
  const stack = Error();
  if (is$7.fn(callback)) {
    if (this._isStreamInput()) {
      this.on("finish", () => {
        this._flattenBufferIn();
        sharp$3.stats(this.options, (err, stats2) => {
          if (err) {
            callback(is$7.nativeError(err, stack));
          } else {
            callback(null, stats2);
          }
        });
      });
    } else {
      sharp$3.stats(this.options, (err, stats2) => {
        if (err) {
          callback(is$7.nativeError(err, stack));
        } else {
          callback(null, stats2);
        }
      });
    }
    return this;
  } else {
    if (this._isStreamInput()) {
      return new Promise((resolve, reject) => {
        this.on("finish", function() {
          this._flattenBufferIn();
          sharp$3.stats(this.options, (err, stats2) => {
            if (err) {
              reject(is$7.nativeError(err, stack));
            } else {
              resolve(stats2);
            }
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        sharp$3.stats(this.options, (err, stats2) => {
          if (err) {
            reject(is$7.nativeError(err, stack));
          } else {
            resolve(stats2);
          }
        });
      });
    }
  }
}
var input = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    // Private
    _inputOptionsFromObject,
    _createInputDescriptor,
    _write,
    _flattenBufferIn,
    _isStreamInput,
    // Public
    metadata,
    stats
  });
  Sharp2.align = align;
};
const is$6 = is$9;
const gravity = {
  center: 0,
  centre: 0,
  north: 1,
  east: 2,
  south: 3,
  west: 4,
  northeast: 5,
  southeast: 6,
  southwest: 7,
  northwest: 8
};
const position = {
  top: 1,
  right: 2,
  bottom: 3,
  left: 4,
  "right top": 5,
  "right bottom": 6,
  "left bottom": 7,
  "left top": 8
};
const extendWith = {
  background: "background",
  copy: "copy",
  repeat: "repeat",
  mirror: "mirror"
};
const strategy = {
  entropy: 16,
  attention: 17
};
const kernel = {
  nearest: "nearest",
  linear: "linear",
  cubic: "cubic",
  mitchell: "mitchell",
  lanczos2: "lanczos2",
  lanczos3: "lanczos3",
  mks2013: "mks2013",
  mks2021: "mks2021"
};
const fit = {
  contain: "contain",
  cover: "cover",
  fill: "fill",
  inside: "inside",
  outside: "outside"
};
const mapFitToCanvas = {
  contain: "embed",
  cover: "crop",
  fill: "ignore_aspect",
  inside: "max",
  outside: "min"
};
function isRotationExpected(options) {
  return options.angle % 360 !== 0 || options.rotationAngle !== 0;
}
function isResizeExpected(options) {
  return options.width !== -1 || options.height !== -1;
}
function resize(widthOrOptions, height, options) {
  if (isResizeExpected(this.options)) {
    this.options.debuglog("ignoring previous resize options");
  }
  if (this.options.widthPost !== -1) {
    this.options.debuglog("operation order will be: extract, resize, extract");
  }
  if (is$6.defined(widthOrOptions)) {
    if (is$6.object(widthOrOptions) && !is$6.defined(options)) {
      options = widthOrOptions;
    } else if (is$6.integer(widthOrOptions) && widthOrOptions > 0) {
      this.options.width = widthOrOptions;
    } else {
      throw is$6.invalidParameterError("width", "positive integer", widthOrOptions);
    }
  } else {
    this.options.width = -1;
  }
  if (is$6.defined(height)) {
    if (is$6.integer(height) && height > 0) {
      this.options.height = height;
    } else {
      throw is$6.invalidParameterError("height", "positive integer", height);
    }
  } else {
    this.options.height = -1;
  }
  if (is$6.object(options)) {
    if (is$6.defined(options.width)) {
      if (is$6.integer(options.width) && options.width > 0) {
        this.options.width = options.width;
      } else {
        throw is$6.invalidParameterError("width", "positive integer", options.width);
      }
    }
    if (is$6.defined(options.height)) {
      if (is$6.integer(options.height) && options.height > 0) {
        this.options.height = options.height;
      } else {
        throw is$6.invalidParameterError("height", "positive integer", options.height);
      }
    }
    if (is$6.defined(options.fit)) {
      const canvas = mapFitToCanvas[options.fit];
      if (is$6.string(canvas)) {
        this.options.canvas = canvas;
      } else {
        throw is$6.invalidParameterError("fit", "valid fit", options.fit);
      }
    }
    if (is$6.defined(options.position)) {
      const pos = is$6.integer(options.position) ? options.position : strategy[options.position] || position[options.position] || gravity[options.position];
      if (is$6.integer(pos) && (is$6.inRange(pos, 0, 8) || is$6.inRange(pos, 16, 17))) {
        this.options.position = pos;
      } else {
        throw is$6.invalidParameterError("position", "valid position/gravity/strategy", options.position);
      }
    }
    this._setBackgroundColourOption("resizeBackground", options.background);
    if (is$6.defined(options.kernel)) {
      if (is$6.string(kernel[options.kernel])) {
        this.options.kernel = kernel[options.kernel];
      } else {
        throw is$6.invalidParameterError("kernel", "valid kernel name", options.kernel);
      }
    }
    if (is$6.defined(options.withoutEnlargement)) {
      this._setBooleanOption("withoutEnlargement", options.withoutEnlargement);
    }
    if (is$6.defined(options.withoutReduction)) {
      this._setBooleanOption("withoutReduction", options.withoutReduction);
    }
    if (is$6.defined(options.fastShrinkOnLoad)) {
      this._setBooleanOption("fastShrinkOnLoad", options.fastShrinkOnLoad);
    }
  }
  if (isRotationExpected(this.options) && isResizeExpected(this.options)) {
    this.options.rotateBefore = true;
  }
  return this;
}
function extend(extend2) {
  if (is$6.integer(extend2) && extend2 > 0) {
    this.options.extendTop = extend2;
    this.options.extendBottom = extend2;
    this.options.extendLeft = extend2;
    this.options.extendRight = extend2;
  } else if (is$6.object(extend2)) {
    if (is$6.defined(extend2.top)) {
      if (is$6.integer(extend2.top) && extend2.top >= 0) {
        this.options.extendTop = extend2.top;
      } else {
        throw is$6.invalidParameterError("top", "positive integer", extend2.top);
      }
    }
    if (is$6.defined(extend2.bottom)) {
      if (is$6.integer(extend2.bottom) && extend2.bottom >= 0) {
        this.options.extendBottom = extend2.bottom;
      } else {
        throw is$6.invalidParameterError("bottom", "positive integer", extend2.bottom);
      }
    }
    if (is$6.defined(extend2.left)) {
      if (is$6.integer(extend2.left) && extend2.left >= 0) {
        this.options.extendLeft = extend2.left;
      } else {
        throw is$6.invalidParameterError("left", "positive integer", extend2.left);
      }
    }
    if (is$6.defined(extend2.right)) {
      if (is$6.integer(extend2.right) && extend2.right >= 0) {
        this.options.extendRight = extend2.right;
      } else {
        throw is$6.invalidParameterError("right", "positive integer", extend2.right);
      }
    }
    this._setBackgroundColourOption("extendBackground", extend2.background);
    if (is$6.defined(extend2.extendWith)) {
      if (is$6.string(extendWith[extend2.extendWith])) {
        this.options.extendWith = extendWith[extend2.extendWith];
      } else {
        throw is$6.invalidParameterError("extendWith", "one of: background, copy, repeat, mirror", extend2.extendWith);
      }
    }
  } else {
    throw is$6.invalidParameterError("extend", "integer or object", extend2);
  }
  return this;
}
function extract(options) {
  const suffix = isResizeExpected(this.options) || this.options.widthPre !== -1 ? "Post" : "Pre";
  if (this.options[`width${suffix}`] !== -1) {
    this.options.debuglog("ignoring previous extract options");
  }
  ["left", "top", "width", "height"].forEach(function(name) {
    const value = options[name];
    if (is$6.integer(value) && value >= 0) {
      this.options[name + (name === "left" || name === "top" ? "Offset" : "") + suffix] = value;
    } else {
      throw is$6.invalidParameterError(name, "integer", value);
    }
  }, this);
  if (isRotationExpected(this.options) && !isResizeExpected(this.options)) {
    if (this.options.widthPre === -1 || this.options.widthPost === -1) {
      this.options.rotateBefore = true;
    }
  }
  if (this.options.input.autoOrient) {
    this.options.orientBefore = true;
  }
  return this;
}
function trim(options) {
  this.options.trimThreshold = 10;
  if (is$6.defined(options)) {
    if (is$6.object(options)) {
      if (is$6.defined(options.background)) {
        this._setBackgroundColourOption("trimBackground", options.background);
      }
      if (is$6.defined(options.threshold)) {
        if (is$6.number(options.threshold) && options.threshold >= 0) {
          this.options.trimThreshold = options.threshold;
        } else {
          throw is$6.invalidParameterError("threshold", "positive number", options.threshold);
        }
      }
      if (is$6.defined(options.lineArt)) {
        this._setBooleanOption("trimLineArt", options.lineArt);
      }
    } else {
      throw is$6.invalidParameterError("trim", "object", options);
    }
  }
  if (isRotationExpected(this.options)) {
    this.options.rotateBefore = true;
  }
  return this;
}
var resize_1 = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    resize,
    extend,
    extract,
    trim
  });
  Sharp2.gravity = gravity;
  Sharp2.strategy = strategy;
  Sharp2.kernel = kernel;
  Sharp2.fit = fit;
  Sharp2.position = position;
};
const is$5 = is$9;
const blend = {
  clear: "clear",
  source: "source",
  over: "over",
  in: "in",
  out: "out",
  atop: "atop",
  dest: "dest",
  "dest-over": "dest-over",
  "dest-in": "dest-in",
  "dest-out": "dest-out",
  "dest-atop": "dest-atop",
  xor: "xor",
  add: "add",
  saturate: "saturate",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  "colour-dodge": "colour-dodge",
  "color-dodge": "colour-dodge",
  "colour-burn": "colour-burn",
  "color-burn": "colour-burn",
  "hard-light": "hard-light",
  "soft-light": "soft-light",
  difference: "difference",
  exclusion: "exclusion"
};
function composite(images) {
  if (!Array.isArray(images)) {
    throw is$5.invalidParameterError("images to composite", "array", images);
  }
  this.options.composite = images.map((image) => {
    if (!is$5.object(image)) {
      throw is$5.invalidParameterError("image to composite", "object", image);
    }
    const inputOptions = this._inputOptionsFromObject(image);
    const composite2 = {
      input: this._createInputDescriptor(image.input, inputOptions, { allowStream: false }),
      blend: "over",
      tile: false,
      left: 0,
      top: 0,
      hasOffset: false,
      gravity: 0,
      premultiplied: false
    };
    if (is$5.defined(image.blend)) {
      if (is$5.string(blend[image.blend])) {
        composite2.blend = blend[image.blend];
      } else {
        throw is$5.invalidParameterError("blend", "valid blend name", image.blend);
      }
    }
    if (is$5.defined(image.tile)) {
      if (is$5.bool(image.tile)) {
        composite2.tile = image.tile;
      } else {
        throw is$5.invalidParameterError("tile", "boolean", image.tile);
      }
    }
    if (is$5.defined(image.left)) {
      if (is$5.integer(image.left)) {
        composite2.left = image.left;
      } else {
        throw is$5.invalidParameterError("left", "integer", image.left);
      }
    }
    if (is$5.defined(image.top)) {
      if (is$5.integer(image.top)) {
        composite2.top = image.top;
      } else {
        throw is$5.invalidParameterError("top", "integer", image.top);
      }
    }
    if (is$5.defined(image.top) !== is$5.defined(image.left)) {
      throw new Error("Expected both left and top to be set");
    } else {
      composite2.hasOffset = is$5.integer(image.top) && is$5.integer(image.left);
    }
    if (is$5.defined(image.gravity)) {
      if (is$5.integer(image.gravity) && is$5.inRange(image.gravity, 0, 8)) {
        composite2.gravity = image.gravity;
      } else if (is$5.string(image.gravity) && is$5.integer(this.constructor.gravity[image.gravity])) {
        composite2.gravity = this.constructor.gravity[image.gravity];
      } else {
        throw is$5.invalidParameterError("gravity", "valid gravity", image.gravity);
      }
    }
    if (is$5.defined(image.premultiplied)) {
      if (is$5.bool(image.premultiplied)) {
        composite2.premultiplied = image.premultiplied;
      } else {
        throw is$5.invalidParameterError("premultiplied", "boolean", image.premultiplied);
      }
    }
    return composite2;
  });
  return this;
}
var composite_1 = function(Sharp2) {
  Sharp2.prototype.composite = composite;
  Sharp2.blend = blend;
};
const is$4 = is$9;
const vipsPrecision = {
  integer: "integer",
  float: "float",
  approximate: "approximate"
};
function rotate(angle, options) {
  if (!is$4.defined(angle)) {
    return this.autoOrient();
  }
  if (this.options.angle || this.options.rotationAngle) {
    this.options.debuglog("ignoring previous rotate options");
    this.options.angle = 0;
    this.options.rotationAngle = 0;
  }
  if (is$4.integer(angle) && !(angle % 90)) {
    this.options.angle = angle;
  } else if (is$4.number(angle)) {
    this.options.rotationAngle = angle;
    if (is$4.object(options) && options.background) {
      this._setBackgroundColourOption("rotationBackground", options.background);
    }
  } else {
    throw is$4.invalidParameterError("angle", "numeric", angle);
  }
  return this;
}
function autoOrient() {
  this.options.input.autoOrient = true;
  return this;
}
function flip(flip2) {
  this.options.flip = is$4.bool(flip2) ? flip2 : true;
  return this;
}
function flop(flop2) {
  this.options.flop = is$4.bool(flop2) ? flop2 : true;
  return this;
}
function affine(matrix, options) {
  const flatMatrix = [].concat(...matrix);
  if (flatMatrix.length === 4 && flatMatrix.every(is$4.number)) {
    this.options.affineMatrix = flatMatrix;
  } else {
    throw is$4.invalidParameterError("matrix", "1x4 or 2x2 array", matrix);
  }
  if (is$4.defined(options)) {
    if (is$4.object(options)) {
      this._setBackgroundColourOption("affineBackground", options.background);
      if (is$4.defined(options.idx)) {
        if (is$4.number(options.idx)) {
          this.options.affineIdx = options.idx;
        } else {
          throw is$4.invalidParameterError("options.idx", "number", options.idx);
        }
      }
      if (is$4.defined(options.idy)) {
        if (is$4.number(options.idy)) {
          this.options.affineIdy = options.idy;
        } else {
          throw is$4.invalidParameterError("options.idy", "number", options.idy);
        }
      }
      if (is$4.defined(options.odx)) {
        if (is$4.number(options.odx)) {
          this.options.affineOdx = options.odx;
        } else {
          throw is$4.invalidParameterError("options.odx", "number", options.odx);
        }
      }
      if (is$4.defined(options.ody)) {
        if (is$4.number(options.ody)) {
          this.options.affineOdy = options.ody;
        } else {
          throw is$4.invalidParameterError("options.ody", "number", options.ody);
        }
      }
      if (is$4.defined(options.interpolator)) {
        if (is$4.inArray(options.interpolator, Object.values(this.constructor.interpolators))) {
          this.options.affineInterpolator = options.interpolator;
        } else {
          throw is$4.invalidParameterError("options.interpolator", "valid interpolator name", options.interpolator);
        }
      }
    } else {
      throw is$4.invalidParameterError("options", "object", options);
    }
  }
  return this;
}
function sharpen(options, flat, jagged) {
  if (!is$4.defined(options)) {
    this.options.sharpenSigma = -1;
  } else if (is$4.bool(options)) {
    this.options.sharpenSigma = options ? -1 : 0;
  } else if (is$4.number(options) && is$4.inRange(options, 0.01, 1e4)) {
    this.options.sharpenSigma = options;
    if (is$4.defined(flat)) {
      if (is$4.number(flat) && is$4.inRange(flat, 0, 1e4)) {
        this.options.sharpenM1 = flat;
      } else {
        throw is$4.invalidParameterError("flat", "number between 0 and 10000", flat);
      }
    }
    if (is$4.defined(jagged)) {
      if (is$4.number(jagged) && is$4.inRange(jagged, 0, 1e4)) {
        this.options.sharpenM2 = jagged;
      } else {
        throw is$4.invalidParameterError("jagged", "number between 0 and 10000", jagged);
      }
    }
  } else if (is$4.plainObject(options)) {
    if (is$4.number(options.sigma) && is$4.inRange(options.sigma, 1e-6, 10)) {
      this.options.sharpenSigma = options.sigma;
    } else {
      throw is$4.invalidParameterError("options.sigma", "number between 0.000001 and 10", options.sigma);
    }
    if (is$4.defined(options.m1)) {
      if (is$4.number(options.m1) && is$4.inRange(options.m1, 0, 1e6)) {
        this.options.sharpenM1 = options.m1;
      } else {
        throw is$4.invalidParameterError("options.m1", "number between 0 and 1000000", options.m1);
      }
    }
    if (is$4.defined(options.m2)) {
      if (is$4.number(options.m2) && is$4.inRange(options.m2, 0, 1e6)) {
        this.options.sharpenM2 = options.m2;
      } else {
        throw is$4.invalidParameterError("options.m2", "number between 0 and 1000000", options.m2);
      }
    }
    if (is$4.defined(options.x1)) {
      if (is$4.number(options.x1) && is$4.inRange(options.x1, 0, 1e6)) {
        this.options.sharpenX1 = options.x1;
      } else {
        throw is$4.invalidParameterError("options.x1", "number between 0 and 1000000", options.x1);
      }
    }
    if (is$4.defined(options.y2)) {
      if (is$4.number(options.y2) && is$4.inRange(options.y2, 0, 1e6)) {
        this.options.sharpenY2 = options.y2;
      } else {
        throw is$4.invalidParameterError("options.y2", "number between 0 and 1000000", options.y2);
      }
    }
    if (is$4.defined(options.y3)) {
      if (is$4.number(options.y3) && is$4.inRange(options.y3, 0, 1e6)) {
        this.options.sharpenY3 = options.y3;
      } else {
        throw is$4.invalidParameterError("options.y3", "number between 0 and 1000000", options.y3);
      }
    }
  } else {
    throw is$4.invalidParameterError("sigma", "number between 0.01 and 10000", options);
  }
  return this;
}
function median(size) {
  if (!is$4.defined(size)) {
    this.options.medianSize = 3;
  } else if (is$4.integer(size) && is$4.inRange(size, 1, 1e3)) {
    this.options.medianSize = size;
  } else {
    throw is$4.invalidParameterError("size", "integer between 1 and 1000", size);
  }
  return this;
}
function blur(options) {
  let sigma;
  if (is$4.number(options)) {
    sigma = options;
  } else if (is$4.plainObject(options)) {
    if (!is$4.number(options.sigma)) {
      throw is$4.invalidParameterError("options.sigma", "number between 0.3 and 1000", sigma);
    }
    sigma = options.sigma;
    if ("precision" in options) {
      if (is$4.string(vipsPrecision[options.precision])) {
        this.options.precision = vipsPrecision[options.precision];
      } else {
        throw is$4.invalidParameterError("precision", "one of: integer, float, approximate", options.precision);
      }
    }
    if ("minAmplitude" in options) {
      if (is$4.number(options.minAmplitude) && is$4.inRange(options.minAmplitude, 1e-3, 1)) {
        this.options.minAmpl = options.minAmplitude;
      } else {
        throw is$4.invalidParameterError("minAmplitude", "number between 0.001 and 1", options.minAmplitude);
      }
    }
  }
  if (!is$4.defined(options)) {
    this.options.blurSigma = -1;
  } else if (is$4.bool(options)) {
    this.options.blurSigma = options ? -1 : 0;
  } else if (is$4.number(sigma) && is$4.inRange(sigma, 0.3, 1e3)) {
    this.options.blurSigma = sigma;
  } else {
    throw is$4.invalidParameterError("sigma", "number between 0.3 and 1000", sigma);
  }
  return this;
}
function dilate(width) {
  if (!is$4.defined(width)) {
    this.options.dilateWidth = 1;
  } else if (is$4.integer(width) && width > 0) {
    this.options.dilateWidth = width;
  } else {
    throw is$4.invalidParameterError("dilate", "positive integer", dilate);
  }
  return this;
}
function erode(width) {
  if (!is$4.defined(width)) {
    this.options.erodeWidth = 1;
  } else if (is$4.integer(width) && width > 0) {
    this.options.erodeWidth = width;
  } else {
    throw is$4.invalidParameterError("erode", "positive integer", erode);
  }
  return this;
}
function flatten(options) {
  this.options.flatten = is$4.bool(options) ? options : true;
  if (is$4.object(options)) {
    this._setBackgroundColourOption("flattenBackground", options.background);
  }
  return this;
}
function unflatten() {
  this.options.unflatten = true;
  return this;
}
function gamma(gamma2, gammaOut) {
  if (!is$4.defined(gamma2)) {
    this.options.gamma = 2.2;
  } else if (is$4.number(gamma2) && is$4.inRange(gamma2, 1, 3)) {
    this.options.gamma = gamma2;
  } else {
    throw is$4.invalidParameterError("gamma", "number between 1.0 and 3.0", gamma2);
  }
  if (!is$4.defined(gammaOut)) {
    this.options.gammaOut = this.options.gamma;
  } else if (is$4.number(gammaOut) && is$4.inRange(gammaOut, 1, 3)) {
    this.options.gammaOut = gammaOut;
  } else {
    throw is$4.invalidParameterError("gammaOut", "number between 1.0 and 3.0", gammaOut);
  }
  return this;
}
function negate(options) {
  this.options.negate = is$4.bool(options) ? options : true;
  if (is$4.plainObject(options) && "alpha" in options) {
    if (!is$4.bool(options.alpha)) {
      throw is$4.invalidParameterError("alpha", "should be boolean value", options.alpha);
    } else {
      this.options.negateAlpha = options.alpha;
    }
  }
  return this;
}
function normalise(options) {
  if (is$4.plainObject(options)) {
    if (is$4.defined(options.lower)) {
      if (is$4.number(options.lower) && is$4.inRange(options.lower, 0, 99)) {
        this.options.normaliseLower = options.lower;
      } else {
        throw is$4.invalidParameterError("lower", "number between 0 and 99", options.lower);
      }
    }
    if (is$4.defined(options.upper)) {
      if (is$4.number(options.upper) && is$4.inRange(options.upper, 1, 100)) {
        this.options.normaliseUpper = options.upper;
      } else {
        throw is$4.invalidParameterError("upper", "number between 1 and 100", options.upper);
      }
    }
  }
  if (this.options.normaliseLower >= this.options.normaliseUpper) {
    throw is$4.invalidParameterError(
      "range",
      "lower to be less than upper",
      `${this.options.normaliseLower} >= ${this.options.normaliseUpper}`
    );
  }
  this.options.normalise = true;
  return this;
}
function normalize(options) {
  return this.normalise(options);
}
function clahe(options) {
  if (is$4.plainObject(options)) {
    if (is$4.integer(options.width) && options.width > 0) {
      this.options.claheWidth = options.width;
    } else {
      throw is$4.invalidParameterError("width", "integer greater than zero", options.width);
    }
    if (is$4.integer(options.height) && options.height > 0) {
      this.options.claheHeight = options.height;
    } else {
      throw is$4.invalidParameterError("height", "integer greater than zero", options.height);
    }
    if (is$4.defined(options.maxSlope)) {
      if (is$4.integer(options.maxSlope) && is$4.inRange(options.maxSlope, 0, 100)) {
        this.options.claheMaxSlope = options.maxSlope;
      } else {
        throw is$4.invalidParameterError("maxSlope", "integer between 0 and 100", options.maxSlope);
      }
    }
  } else {
    throw is$4.invalidParameterError("options", "plain object", options);
  }
  return this;
}
function convolve(kernel2) {
  if (!is$4.object(kernel2) || !Array.isArray(kernel2.kernel) || !is$4.integer(kernel2.width) || !is$4.integer(kernel2.height) || !is$4.inRange(kernel2.width, 3, 1001) || !is$4.inRange(kernel2.height, 3, 1001) || kernel2.height * kernel2.width !== kernel2.kernel.length) {
    throw new Error("Invalid convolution kernel");
  }
  if (!is$4.integer(kernel2.scale)) {
    kernel2.scale = kernel2.kernel.reduce(function(a, b) {
      return a + b;
    }, 0);
  }
  if (kernel2.scale < 1) {
    kernel2.scale = 1;
  }
  if (!is$4.integer(kernel2.offset)) {
    kernel2.offset = 0;
  }
  this.options.convKernel = kernel2;
  return this;
}
function threshold(threshold2, options) {
  if (!is$4.defined(threshold2)) {
    this.options.threshold = 128;
  } else if (is$4.bool(threshold2)) {
    this.options.threshold = threshold2 ? 128 : 0;
  } else if (is$4.integer(threshold2) && is$4.inRange(threshold2, 0, 255)) {
    this.options.threshold = threshold2;
  } else {
    throw is$4.invalidParameterError("threshold", "integer between 0 and 255", threshold2);
  }
  if (!is$4.object(options) || options.greyscale === true || options.grayscale === true) {
    this.options.thresholdGrayscale = true;
  } else {
    this.options.thresholdGrayscale = false;
  }
  return this;
}
function boolean(operand, operator, options) {
  this.options.boolean = this._createInputDescriptor(operand, options);
  if (is$4.string(operator) && is$4.inArray(operator, ["and", "or", "eor"])) {
    this.options.booleanOp = operator;
  } else {
    throw is$4.invalidParameterError("operator", "one of: and, or, eor", operator);
  }
  return this;
}
function linear(a, b) {
  if (!is$4.defined(a) && is$4.number(b)) {
    a = 1;
  } else if (is$4.number(a) && !is$4.defined(b)) {
    b = 0;
  }
  if (!is$4.defined(a)) {
    this.options.linearA = [];
  } else if (is$4.number(a)) {
    this.options.linearA = [a];
  } else if (Array.isArray(a) && a.length && a.every(is$4.number)) {
    this.options.linearA = a;
  } else {
    throw is$4.invalidParameterError("a", "number or array of numbers", a);
  }
  if (!is$4.defined(b)) {
    this.options.linearB = [];
  } else if (is$4.number(b)) {
    this.options.linearB = [b];
  } else if (Array.isArray(b) && b.length && b.every(is$4.number)) {
    this.options.linearB = b;
  } else {
    throw is$4.invalidParameterError("b", "number or array of numbers", b);
  }
  if (this.options.linearA.length !== this.options.linearB.length) {
    throw new Error("Expected a and b to be arrays of the same length");
  }
  return this;
}
function recomb(inputMatrix) {
  if (!Array.isArray(inputMatrix)) {
    throw is$4.invalidParameterError("inputMatrix", "array", inputMatrix);
  }
  if (inputMatrix.length !== 3 && inputMatrix.length !== 4) {
    throw is$4.invalidParameterError("inputMatrix", "3x3 or 4x4 array", inputMatrix.length);
  }
  const recombMatrix = inputMatrix.flat().map(Number);
  if (recombMatrix.length !== 9 && recombMatrix.length !== 16) {
    throw is$4.invalidParameterError("inputMatrix", "cardinality of 9 or 16", recombMatrix.length);
  }
  this.options.recombMatrix = recombMatrix;
  return this;
}
function modulate(options) {
  if (!is$4.plainObject(options)) {
    throw is$4.invalidParameterError("options", "plain object", options);
  }
  if ("brightness" in options) {
    if (is$4.number(options.brightness) && options.brightness >= 0) {
      this.options.brightness = options.brightness;
    } else {
      throw is$4.invalidParameterError("brightness", "number above zero", options.brightness);
    }
  }
  if ("saturation" in options) {
    if (is$4.number(options.saturation) && options.saturation >= 0) {
      this.options.saturation = options.saturation;
    } else {
      throw is$4.invalidParameterError("saturation", "number above zero", options.saturation);
    }
  }
  if ("hue" in options) {
    if (is$4.integer(options.hue)) {
      this.options.hue = options.hue % 360;
    } else {
      throw is$4.invalidParameterError("hue", "number", options.hue);
    }
  }
  if ("lightness" in options) {
    if (is$4.number(options.lightness)) {
      this.options.lightness = options.lightness;
    } else {
      throw is$4.invalidParameterError("lightness", "number", options.lightness);
    }
  }
  return this;
}
var operation = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    autoOrient,
    rotate,
    flip,
    flop,
    affine,
    sharpen,
    erode,
    dilate,
    median,
    blur,
    flatten,
    unflatten,
    gamma,
    negate,
    normalise,
    normalize,
    clahe,
    convolve,
    threshold,
    boolean,
    linear,
    recomb,
    modulate
  });
};
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
var color$1 = __toCommonJS(index_exports);
var color_name_default = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};
var reverseNames = /* @__PURE__ */ Object.create(null);
for (const name in color_name_default) {
  if (Object.hasOwn(color_name_default, name)) {
    reverseNames[color_name_default[name]] = name;
  }
}
var cs = {
  to: {},
  get: {}
};
cs.get = function(string2) {
  const prefix = string2.slice(0, 3).toLowerCase();
  let value;
  let model;
  switch (prefix) {
    case "hsl": {
      value = cs.get.hsl(string2);
      model = "hsl";
      break;
    }
    case "hwb": {
      value = cs.get.hwb(string2);
      model = "hwb";
      break;
    }
    default: {
      value = cs.get.rgb(string2);
      model = "rgb";
      break;
    }
  }
  if (!value) {
    return null;
  }
  return { model, value };
};
cs.get.rgb = function(string2) {
  if (!string2) {
    return null;
  }
  const abbr = /^#([a-f\d]{3,4})$/i;
  const hex = /^#([a-f\d]{6})([a-f\d]{2})?$/i;
  const rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[\s,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/;
  const per = /^rgba?\(\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[\s,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/;
  const keyword = /^(\w+)$/;
  let rgb = [0, 0, 0, 1];
  let match;
  let i;
  let hexAlpha;
  if (match = string2.match(hex)) {
    hexAlpha = match[2];
    match = match[1];
    for (i = 0; i < 3; i++) {
      const i2 = i * 2;
      rgb[i] = Number.parseInt(match.slice(i2, i2 + 2), 16);
    }
    if (hexAlpha) {
      rgb[3] = Number.parseInt(hexAlpha, 16) / 255;
    }
  } else if (match = string2.match(abbr)) {
    match = match[1];
    hexAlpha = match[3];
    for (i = 0; i < 3; i++) {
      rgb[i] = Number.parseInt(match[i] + match[i], 16);
    }
    if (hexAlpha) {
      rgb[3] = Number.parseInt(hexAlpha + hexAlpha, 16) / 255;
    }
  } else if (match = string2.match(rgba)) {
    for (i = 0; i < 3; i++) {
      rgb[i] = Number.parseInt(match[i + 1], 10);
    }
    if (match[4]) {
      rgb[3] = match[5] ? Number.parseFloat(match[4]) * 0.01 : Number.parseFloat(match[4]);
    }
  } else if (match = string2.match(per)) {
    for (i = 0; i < 3; i++) {
      rgb[i] = Math.round(Number.parseFloat(match[i + 1]) * 2.55);
    }
    if (match[4]) {
      rgb[3] = match[5] ? Number.parseFloat(match[4]) * 0.01 : Number.parseFloat(match[4]);
    }
  } else if (match = string2.match(keyword)) {
    if (match[1] === "transparent") {
      return [0, 0, 0, 0];
    }
    if (!Object.hasOwn(color_name_default, match[1])) {
      return null;
    }
    rgb = color_name_default[match[1]];
    rgb[3] = 1;
    return rgb;
  } else {
    return null;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] = clamp(rgb[i], 0, 255);
  }
  rgb[3] = clamp(rgb[3], 0, 1);
  return rgb;
};
cs.get.hsl = function(string2) {
  if (!string2) {
    return null;
  }
  const hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
  const match = string2.match(hsl);
  if (match) {
    const alpha = Number.parseFloat(match[4]);
    const h = (Number.parseFloat(match[1]) % 360 + 360) % 360;
    const s = clamp(Number.parseFloat(match[2]), 0, 100);
    const l = clamp(Number.parseFloat(match[3]), 0, 100);
    const a = clamp(Number.isNaN(alpha) ? 1 : alpha, 0, 1);
    return [h, s, l, a];
  }
  return null;
};
cs.get.hwb = function(string2) {
  if (!string2) {
    return null;
  }
  const hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*[\s,]\s*([+-]?[\d.]+)%\s*[\s,]\s*([+-]?[\d.]+)%\s*(?:[\s,]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
  const match = string2.match(hwb);
  if (match) {
    const alpha = Number.parseFloat(match[4]);
    const h = (Number.parseFloat(match[1]) % 360 + 360) % 360;
    const w = clamp(Number.parseFloat(match[2]), 0, 100);
    const b = clamp(Number.parseFloat(match[3]), 0, 100);
    const a = clamp(Number.isNaN(alpha) ? 1 : alpha, 0, 1);
    return [h, w, b, a];
  }
  return null;
};
cs.to.hex = function(...rgba) {
  return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
};
cs.to.rgb = function(...rgba) {
  return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
};
cs.to.rgb.percent = function(...rgba) {
  const r = Math.round(rgba[0] / 255 * 100);
  const g = Math.round(rgba[1] / 255 * 100);
  const b = Math.round(rgba[2] / 255 * 100);
  return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
};
cs.to.hsl = function(...hsla) {
  return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
};
cs.to.hwb = function(...hwba) {
  let a = "";
  if (hwba.length >= 4 && hwba[3] !== 1) {
    a = ", " + hwba[3];
  }
  return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
};
cs.to.keyword = function(...rgb) {
  return reverseNames[rgb.slice(0, 3)];
};
function clamp(number_, min, max) {
  return Math.min(Math.max(min, number_), max);
}
function hexDouble(number_) {
  const string_ = Math.round(number_).toString(16).toUpperCase();
  return string_.length < 2 ? "0" + string_ : string_;
}
var color_string_default = cs;
var reverseKeywords = {};
for (const key of Object.keys(color_name_default)) {
  reverseKeywords[color_name_default[key]] = key;
}
var convert = {
  rgb: { channels: 3, labels: "rgb" },
  hsl: { channels: 3, labels: "hsl" },
  hsv: { channels: 3, labels: "hsv" },
  hwb: { channels: 3, labels: "hwb" },
  cmyk: { channels: 4, labels: "cmyk" },
  xyz: { channels: 3, labels: "xyz" },
  lab: { channels: 3, labels: "lab" },
  oklab: { channels: 3, labels: ["okl", "oka", "okb"] },
  lch: { channels: 3, labels: "lch" },
  oklch: { channels: 3, labels: ["okl", "okc", "okh"] },
  hex: { channels: 1, labels: ["hex"] },
  keyword: { channels: 1, labels: ["keyword"] },
  ansi16: { channels: 1, labels: ["ansi16"] },
  ansi256: { channels: 1, labels: ["ansi256"] },
  hcg: { channels: 3, labels: ["h", "c", "g"] },
  apple: { channels: 3, labels: ["r16", "g16", "b16"] },
  gray: { channels: 1, labels: ["gray"] }
};
var conversions_default = convert;
var LAB_FT = (6 / 29) ** 3;
function srgbNonlinearTransform(c) {
  const cc = c > 31308e-7 ? 1.055 * c ** (1 / 2.4) - 0.055 : c * 12.92;
  return Math.min(Math.max(0, cc), 1);
}
function srgbNonlinearTransformInv(c) {
  return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
}
for (const model of Object.keys(convert)) {
  if (!("channels" in convert[model])) {
    throw new Error("missing channels property: " + model);
  }
  if (!("labels" in convert[model])) {
    throw new Error("missing channel labels property: " + model);
  }
  if (convert[model].labels.length !== convert[model].channels) {
    throw new Error("channel and label counts mismatch: " + model);
  }
  const { channels, labels } = convert[model];
  delete convert[model].channels;
  delete convert[model].labels;
  Object.defineProperty(convert[model], "channels", { value: channels });
  Object.defineProperty(convert[model], "labels", { value: labels });
}
convert.rgb.hsl = function(rgb) {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h;
  let s;
  switch (max) {
    case min: {
      h = 0;
      break;
    }
    case r: {
      h = (g - b) / delta;
      break;
    }
    case g: {
      h = 2 + (b - r) / delta;
      break;
    }
    case b: {
      h = 4 + (r - g) / delta;
      break;
    }
  }
  h = Math.min(h * 60, 360);
  if (h < 0) {
    h += 360;
  }
  const l = (min + max) / 2;
  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }
  return [h, s * 100, l * 100];
};
convert.rgb.hsv = function(rgb) {
  let rdif;
  let gdif;
  let bdif;
  let h;
  let s;
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const v = Math.max(r, g, b);
  const diff = v - Math.min(r, g, b);
  const diffc = function(c) {
    return (v - c) / 6 / diff + 1 / 2;
  };
  if (diff === 0) {
    h = 0;
    s = 0;
  } else {
    s = diff / v;
    rdif = diffc(r);
    gdif = diffc(g);
    bdif = diffc(b);
    switch (v) {
      case r: {
        h = bdif - gdif;
        break;
      }
      case g: {
        h = 1 / 3 + rdif - bdif;
        break;
      }
      case b: {
        h = 2 / 3 + gdif - rdif;
        break;
      }
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return [
    h * 360,
    s * 100,
    v * 100
  ];
};
convert.rgb.hwb = function(rgb) {
  const r = rgb[0];
  const g = rgb[1];
  let b = rgb[2];
  const h = convert.rgb.hsl(rgb)[0];
  const w = 1 / 255 * Math.min(r, Math.min(g, b));
  b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
  return [h, w * 100, b * 100];
};
convert.rgb.oklab = function(rgb) {
  const r = srgbNonlinearTransformInv(rgb[0] / 255);
  const g = srgbNonlinearTransformInv(rgb[1] / 255);
  const b = srgbNonlinearTransformInv(rgb[2] / 255);
  const lp = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mp = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const sp = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const l = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
  const aa = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;
  return [l * 100, aa * 100, bb * 100];
};
convert.rgb.cmyk = function(rgb) {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const k = Math.min(1 - r, 1 - g, 1 - b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
};
function comparativeDistance(x, y) {
  return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
}
convert.rgb.keyword = function(rgb) {
  const reversed = reverseKeywords[rgb];
  if (reversed) {
    return reversed;
  }
  let currentClosestDistance = Number.POSITIVE_INFINITY;
  let currentClosestKeyword;
  for (const keyword of Object.keys(color_name_default)) {
    const value = color_name_default[keyword];
    const distance = comparativeDistance(rgb, value);
    if (distance < currentClosestDistance) {
      currentClosestDistance = distance;
      currentClosestKeyword = keyword;
    }
  }
  return currentClosestKeyword;
};
convert.keyword.rgb = function(keyword) {
  return color_name_default[keyword];
};
convert.rgb.xyz = function(rgb) {
  const r = srgbNonlinearTransformInv(rgb[0] / 255);
  const g = srgbNonlinearTransformInv(rgb[1] / 255);
  const b = srgbNonlinearTransformInv(rgb[2] / 255);
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  const z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;
  return [x * 100, y * 100, z * 100];
};
convert.rgb.lab = function(rgb) {
  const xyz = convert.rgb.xyz(rgb);
  let x = xyz[0];
  let y = xyz[1];
  let z = xyz[2];
  x /= 95.047;
  y /= 100;
  z /= 108.883;
  x = x > LAB_FT ? x ** (1 / 3) : 7.787 * x + 16 / 116;
  y = y > LAB_FT ? y ** (1 / 3) : 7.787 * y + 16 / 116;
  z = z > LAB_FT ? z ** (1 / 3) : 7.787 * z + 16 / 116;
  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);
  return [l, a, b];
};
convert.hsl.rgb = function(hsl) {
  const h = hsl[0] / 360;
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;
  let t3;
  let value;
  if (s === 0) {
    value = l * 255;
    return [value, value, value];
  }
  const t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const t1 = 2 * l - t2;
  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * -(i - 1);
    if (t3 < 0) {
      t3++;
    }
    if (t3 > 1) {
      t3--;
    }
    if (6 * t3 < 1) {
      value = t1 + (t2 - t1) * 6 * t3;
    } else if (2 * t3 < 1) {
      value = t2;
    } else if (3 * t3 < 2) {
      value = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    } else {
      value = t1;
    }
    rgb[i] = value * 255;
  }
  return rgb;
};
convert.hsl.hsv = function(hsl) {
  const h = hsl[0];
  let s = hsl[1] / 100;
  let l = hsl[2] / 100;
  let smin = s;
  const lmin = Math.max(l, 0.01);
  l *= 2;
  s *= l <= 1 ? l : 2 - l;
  smin *= lmin <= 1 ? lmin : 2 - lmin;
  const v = (l + s) / 2;
  const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
  return [h, sv * 100, v * 100];
};
convert.hsv.rgb = function(hsv) {
  const h = hsv[0] / 60;
  const s = hsv[1] / 100;
  let v = hsv[2] / 100;
  const hi = Math.floor(h) % 6;
  const f = h - Math.floor(h);
  const p = 255 * v * (1 - s);
  const q = 255 * v * (1 - s * f);
  const t2 = 255 * v * (1 - s * (1 - f));
  v *= 255;
  switch (hi) {
    case 0: {
      return [v, t2, p];
    }
    case 1: {
      return [q, v, p];
    }
    case 2: {
      return [p, v, t2];
    }
    case 3: {
      return [p, q, v];
    }
    case 4: {
      return [t2, p, v];
    }
    case 5: {
      return [v, p, q];
    }
  }
};
convert.hsv.hsl = function(hsv) {
  const h = hsv[0];
  const s = hsv[1] / 100;
  const v = hsv[2] / 100;
  const vmin = Math.max(v, 0.01);
  let sl;
  let l;
  l = (2 - s) * v;
  const lmin = (2 - s) * vmin;
  sl = s * vmin;
  sl /= lmin <= 1 ? lmin : 2 - lmin;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
};
convert.hwb.rgb = function(hwb) {
  const h = hwb[0] / 360;
  let wh = hwb[1] / 100;
  let bl = hwb[2] / 100;
  const ratio = wh + bl;
  let f;
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }
  const i = Math.floor(6 * h);
  const v = 1 - bl;
  f = 6 * h - i;
  if ((i & 1) !== 0) {
    f = 1 - f;
  }
  const n = wh + f * (v - wh);
  let r;
  let g;
  let b;
  switch (i) {
    default:
    case 6:
    case 0: {
      r = v;
      g = n;
      b = wh;
      break;
    }
    case 1: {
      r = n;
      g = v;
      b = wh;
      break;
    }
    case 2: {
      r = wh;
      g = v;
      b = n;
      break;
    }
    case 3: {
      r = wh;
      g = n;
      b = v;
      break;
    }
    case 4: {
      r = n;
      g = wh;
      b = v;
      break;
    }
    case 5: {
      r = v;
      g = wh;
      b = n;
      break;
    }
  }
  return [r * 255, g * 255, b * 255];
};
convert.cmyk.rgb = function(cmyk) {
  const c = cmyk[0] / 100;
  const m = cmyk[1] / 100;
  const y = cmyk[2] / 100;
  const k = cmyk[3] / 100;
  const r = 1 - Math.min(1, c * (1 - k) + k);
  const g = 1 - Math.min(1, m * (1 - k) + k);
  const b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
};
convert.xyz.rgb = function(xyz) {
  const x = xyz[0] / 100;
  const y = xyz[1] / 100;
  const z = xyz[2] / 100;
  let r;
  let g;
  let b;
  r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  g = x * -0.969266 + y * 1.8760108 + z * 0.041556;
  b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;
  r = srgbNonlinearTransform(r);
  g = srgbNonlinearTransform(g);
  b = srgbNonlinearTransform(b);
  return [r * 255, g * 255, b * 255];
};
convert.xyz.lab = function(xyz) {
  let x = xyz[0];
  let y = xyz[1];
  let z = xyz[2];
  x /= 95.047;
  y /= 100;
  z /= 108.883;
  x = x > LAB_FT ? x ** (1 / 3) : 7.787 * x + 16 / 116;
  y = y > LAB_FT ? y ** (1 / 3) : 7.787 * y + 16 / 116;
  z = z > LAB_FT ? z ** (1 / 3) : 7.787 * z + 16 / 116;
  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);
  return [l, a, b];
};
convert.xyz.oklab = function(xyz) {
  const x = xyz[0] / 100;
  const y = xyz[1] / 100;
  const z = xyz[2] / 100;
  const lp = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const mp = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const sp = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);
  const l = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
  const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
  const b = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;
  return [l * 100, a * 100, b * 100];
};
convert.oklab.oklch = function(oklab) {
  return convert.lab.lch(oklab);
};
convert.oklab.xyz = function(oklab) {
  const ll = oklab[0] / 100;
  const a = oklab[1] / 100;
  const b = oklab[2] / 100;
  const l = (0.999999998 * ll + 0.396337792 * a + 0.215803758 * b) ** 3;
  const m = (1.000000008 * ll - 0.105561342 * a - 0.063854175 * b) ** 3;
  const s = (1.000000055 * ll - 0.089484182 * a - 1.291485538 * b) ** 3;
  const x = 1.227013851 * l - 0.55779998 * m + 0.281256149 * s;
  const y = -0.040580178 * l + 1.11225687 * m - 0.071676679 * s;
  const z = -0.076381285 * l - 0.421481978 * m + 1.58616322 * s;
  return [x * 100, y * 100, z * 100];
};
convert.oklab.rgb = function(oklab) {
  const ll = oklab[0] / 100;
  const aa = oklab[1] / 100;
  const bb = oklab[2] / 100;
  const l = (ll + 0.3963377774 * aa + 0.2158037573 * bb) ** 3;
  const m = (ll - 0.1055613458 * aa - 0.0638541728 * bb) ** 3;
  const s = (ll - 0.0894841775 * aa - 1.291485548 * bb) ** 3;
  const r = srgbNonlinearTransform(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = srgbNonlinearTransform(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const b = srgbNonlinearTransform(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return [r * 255, g * 255, b * 255];
};
convert.oklch.oklab = function(oklch) {
  return convert.lch.lab(oklch);
};
convert.lab.xyz = function(lab) {
  const l = lab[0];
  const a = lab[1];
  const b = lab[2];
  let x;
  let y;
  let z;
  y = (l + 16) / 116;
  x = a / 500 + y;
  z = y - b / 200;
  const y2 = y ** 3;
  const x2 = x ** 3;
  const z2 = z ** 3;
  y = y2 > LAB_FT ? y2 : (y - 16 / 116) / 7.787;
  x = x2 > LAB_FT ? x2 : (x - 16 / 116) / 7.787;
  z = z2 > LAB_FT ? z2 : (z - 16 / 116) / 7.787;
  x *= 95.047;
  y *= 100;
  z *= 108.883;
  return [x, y, z];
};
convert.lab.lch = function(lab) {
  const l = lab[0];
  const a = lab[1];
  const b = lab[2];
  let h;
  const hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  const c = Math.sqrt(a * a + b * b);
  return [l, c, h];
};
convert.lch.lab = function(lch) {
  const l = lch[0];
  const c = lch[1];
  const h = lch[2];
  const hr = h / 360 * 2 * Math.PI;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  return [l, a, b];
};
convert.rgb.ansi16 = function(args, saturation = null) {
  const [r, g, b] = args;
  let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
  value = Math.round(value / 50);
  if (value === 0) {
    return 30;
  }
  let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
  if (value === 2) {
    ansi += 60;
  }
  return ansi;
};
convert.hsv.ansi16 = function(args) {
  return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};
convert.rgb.ansi256 = function(args) {
  const r = args[0];
  const g = args[1];
  const b = args[2];
  if (r >> 4 === g >> 4 && g >> 4 === b >> 4) {
    if (r < 8) {
      return 16;
    }
    if (r > 248) {
      return 231;
    }
    return Math.round((r - 8) / 247 * 24) + 232;
  }
  const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
  return ansi;
};
convert.ansi16.rgb = function(args) {
  args = args[0];
  let color2 = args % 10;
  if (color2 === 0 || color2 === 7) {
    if (args > 50) {
      color2 += 3.5;
    }
    color2 = color2 / 10.5 * 255;
    return [color2, color2, color2];
  }
  const mult = (Math.trunc(args > 50) + 1) * 0.5;
  const r = (color2 & 1) * mult * 255;
  const g = (color2 >> 1 & 1) * mult * 255;
  const b = (color2 >> 2 & 1) * mult * 255;
  return [r, g, b];
};
convert.ansi256.rgb = function(args) {
  args = args[0];
  if (args >= 232) {
    const c = (args - 232) * 10 + 8;
    return [c, c, c];
  }
  args -= 16;
  let rem;
  const r = Math.floor(args / 36) / 5 * 255;
  const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
  const b = rem % 6 / 5 * 255;
  return [r, g, b];
};
convert.rgb.hex = function(args) {
  const integer2 = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
  const string2 = integer2.toString(16).toUpperCase();
  return "000000".slice(string2.length) + string2;
};
convert.hex.rgb = function(args) {
  const match = args.toString(16).match(/[a-f\d]{6}|[a-f\d]{3}/i);
  if (!match) {
    return [0, 0, 0];
  }
  let colorString = match[0];
  if (match[0].length === 3) {
    colorString = [...colorString].map((char) => char + char).join("");
  }
  const integer2 = Number.parseInt(colorString, 16);
  const r = integer2 >> 16 & 255;
  const g = integer2 >> 8 & 255;
  const b = integer2 & 255;
  return [r, g, b];
};
convert.rgb.hcg = function(rgb) {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(Math.max(r, g), b);
  const min = Math.min(Math.min(r, g), b);
  const chroma = max - min;
  let hue;
  const grayscale2 = chroma < 1 ? min / (1 - chroma) : 0;
  if (chroma <= 0) {
    hue = 0;
  } else if (max === r) {
    hue = (g - b) / chroma % 6;
  } else if (max === g) {
    hue = 2 + (b - r) / chroma;
  } else {
    hue = 4 + (r - g) / chroma;
  }
  hue /= 6;
  hue %= 1;
  return [hue * 360, chroma * 100, grayscale2 * 100];
};
convert.hsl.hcg = function(hsl) {
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;
  const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
  let f = 0;
  if (c < 1) {
    f = (l - 0.5 * c) / (1 - c);
  }
  return [hsl[0], c * 100, f * 100];
};
convert.hsv.hcg = function(hsv) {
  const s = hsv[1] / 100;
  const v = hsv[2] / 100;
  const c = s * v;
  let f = 0;
  if (c < 1) {
    f = (v - c) / (1 - c);
  }
  return [hsv[0], c * 100, f * 100];
};
convert.hcg.rgb = function(hcg) {
  const h = hcg[0] / 360;
  const c = hcg[1] / 100;
  const g = hcg[2] / 100;
  if (c === 0) {
    return [g * 255, g * 255, g * 255];
  }
  const pure = [0, 0, 0];
  const hi = h % 1 * 6;
  const v = hi % 1;
  const w = 1 - v;
  let mg = 0;
  switch (Math.floor(hi)) {
    case 0: {
      pure[0] = 1;
      pure[1] = v;
      pure[2] = 0;
      break;
    }
    case 1: {
      pure[0] = w;
      pure[1] = 1;
      pure[2] = 0;
      break;
    }
    case 2: {
      pure[0] = 0;
      pure[1] = 1;
      pure[2] = v;
      break;
    }
    case 3: {
      pure[0] = 0;
      pure[1] = w;
      pure[2] = 1;
      break;
    }
    case 4: {
      pure[0] = v;
      pure[1] = 0;
      pure[2] = 1;
      break;
    }
    default: {
      pure[0] = 1;
      pure[1] = 0;
      pure[2] = w;
    }
  }
  mg = (1 - c) * g;
  return [
    (c * pure[0] + mg) * 255,
    (c * pure[1] + mg) * 255,
    (c * pure[2] + mg) * 255
  ];
};
convert.hcg.hsv = function(hcg) {
  const c = hcg[1] / 100;
  const g = hcg[2] / 100;
  const v = c + g * (1 - c);
  let f = 0;
  if (v > 0) {
    f = c / v;
  }
  return [hcg[0], f * 100, v * 100];
};
convert.hcg.hsl = function(hcg) {
  const c = hcg[1] / 100;
  const g = hcg[2] / 100;
  const l = g * (1 - c) + 0.5 * c;
  let s = 0;
  if (l > 0 && l < 0.5) {
    s = c / (2 * l);
  } else if (l >= 0.5 && l < 1) {
    s = c / (2 * (1 - l));
  }
  return [hcg[0], s * 100, l * 100];
};
convert.hcg.hwb = function(hcg) {
  const c = hcg[1] / 100;
  const g = hcg[2] / 100;
  const v = c + g * (1 - c);
  return [hcg[0], (v - c) * 100, (1 - v) * 100];
};
convert.hwb.hcg = function(hwb) {
  const w = hwb[1] / 100;
  const b = hwb[2] / 100;
  const v = 1 - b;
  const c = v - w;
  let g = 0;
  if (c < 1) {
    g = (v - c) / (1 - c);
  }
  return [hwb[0], c * 100, g * 100];
};
convert.apple.rgb = function(apple) {
  return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
};
convert.rgb.apple = function(rgb) {
  return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
};
convert.gray.rgb = function(args) {
  return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};
convert.gray.hsl = function(args) {
  return [0, 0, args[0]];
};
convert.gray.hsv = convert.gray.hsl;
convert.gray.hwb = function(gray) {
  return [0, 100, gray[0]];
};
convert.gray.cmyk = function(gray) {
  return [0, 0, 0, gray[0]];
};
convert.gray.lab = function(gray) {
  return [gray[0], 0, 0];
};
convert.gray.hex = function(gray) {
  const value = Math.round(gray[0] / 100 * 255) & 255;
  const integer2 = (value << 16) + (value << 8) + value;
  const string2 = integer2.toString(16).toUpperCase();
  return "000000".slice(string2.length) + string2;
};
convert.rgb.gray = function(rgb) {
  const value = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return [value / 255 * 100];
};
function buildGraph() {
  const graph = {};
  const models2 = Object.keys(conversions_default);
  for (let { length } = models2, i = 0; i < length; i++) {
    graph[models2[i]] = {
      // http://jsperf.com/1-vs-infinity
      // micro-opt, but this is simple.
      distance: -1,
      parent: null
    };
  }
  return graph;
}
function deriveBFS(fromModel) {
  const graph = buildGraph();
  const queue2 = [fromModel];
  graph[fromModel].distance = 0;
  while (queue2.length > 0) {
    const current = queue2.pop();
    const adjacents = Object.keys(conversions_default[current]);
    for (let { length } = adjacents, i = 0; i < length; i++) {
      const adjacent = adjacents[i];
      const node = graph[adjacent];
      if (node.distance === -1) {
        node.distance = graph[current].distance + 1;
        node.parent = current;
        queue2.unshift(adjacent);
      }
    }
  }
  return graph;
}
function link(from, to) {
  return function(args) {
    return to(from(args));
  };
}
function wrapConversion(toModel, graph) {
  const path2 = [graph[toModel].parent, toModel];
  let fn2 = conversions_default[graph[toModel].parent][toModel];
  let cur = graph[toModel].parent;
  while (graph[cur].parent) {
    path2.unshift(graph[cur].parent);
    fn2 = link(conversions_default[graph[cur].parent][cur], fn2);
    cur = graph[cur].parent;
  }
  fn2.conversion = path2;
  return fn2;
}
function route(fromModel) {
  const graph = deriveBFS(fromModel);
  const conversion = {};
  const models2 = Object.keys(graph);
  for (let { length } = models2, i = 0; i < length; i++) {
    const toModel = models2[i];
    const node = graph[toModel];
    if (node.parent === null) {
      continue;
    }
    conversion[toModel] = wrapConversion(toModel, graph);
  }
  return conversion;
}
var route_default = route;
var convert2 = {};
var models = Object.keys(conversions_default);
function wrapRaw(fn2) {
  const wrappedFn = function(...args) {
    const arg0 = args[0];
    if (arg0 === void 0 || arg0 === null) {
      return arg0;
    }
    if (arg0.length > 1) {
      args = arg0;
    }
    return fn2(args);
  };
  if ("conversion" in fn2) {
    wrappedFn.conversion = fn2.conversion;
  }
  return wrappedFn;
}
function wrapRounded(fn2) {
  const wrappedFn = function(...args) {
    const arg0 = args[0];
    if (arg0 === void 0 || arg0 === null) {
      return arg0;
    }
    if (arg0.length > 1) {
      args = arg0;
    }
    const result = fn2(args);
    if (typeof result === "object") {
      for (let { length } = result, i = 0; i < length; i++) {
        result[i] = Math.round(result[i]);
      }
    }
    return result;
  };
  if ("conversion" in fn2) {
    wrappedFn.conversion = fn2.conversion;
  }
  return wrappedFn;
}
for (const fromModel of models) {
  convert2[fromModel] = {};
  Object.defineProperty(convert2[fromModel], "channels", { value: conversions_default[fromModel].channels });
  Object.defineProperty(convert2[fromModel], "labels", { value: conversions_default[fromModel].labels });
  const routes = route_default(fromModel);
  const routeModels = Object.keys(routes);
  for (const toModel of routeModels) {
    const fn2 = routes[toModel];
    convert2[fromModel][toModel] = wrapRounded(fn2);
    convert2[fromModel][toModel].raw = wrapRaw(fn2);
  }
}
var color_convert_default = convert2;
var skippedModels = [
  // To be honest, I don't really feel like keyword belongs in color convert, but eh.
  "keyword",
  // Gray conflicts with some method names, and has its own method defined.
  "gray",
  // Shouldn't really be in color-convert either...
  "hex"
];
var hashedModelKeys = {};
for (const model of Object.keys(color_convert_default)) {
  hashedModelKeys[[...color_convert_default[model].labels].sort().join("")] = model;
}
var limiters = {};
function Color(object2, model) {
  if (!(this instanceof Color)) {
    return new Color(object2, model);
  }
  if (model && model in skippedModels) {
    model = null;
  }
  if (model && !(model in color_convert_default)) {
    throw new Error("Unknown model: " + model);
  }
  let i;
  let channels;
  if (object2 == null) {
    this.model = "rgb";
    this.color = [0, 0, 0];
    this.valpha = 1;
  } else if (object2 instanceof Color) {
    this.model = object2.model;
    this.color = [...object2.color];
    this.valpha = object2.valpha;
  } else if (typeof object2 === "string") {
    const result = color_string_default.get(object2);
    if (result === null) {
      throw new Error("Unable to parse color from string: " + object2);
    }
    this.model = result.model;
    channels = color_convert_default[this.model].channels;
    this.color = result.value.slice(0, channels);
    this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
  } else if (object2.length > 0) {
    this.model = model || "rgb";
    channels = color_convert_default[this.model].channels;
    const newArray = Array.prototype.slice.call(object2, 0, channels);
    this.color = zeroArray(newArray, channels);
    this.valpha = typeof object2[channels] === "number" ? object2[channels] : 1;
  } else if (typeof object2 === "number") {
    this.model = "rgb";
    this.color = [
      object2 >> 16 & 255,
      object2 >> 8 & 255,
      object2 & 255
    ];
    this.valpha = 1;
  } else {
    this.valpha = 1;
    const keys = Object.keys(object2);
    if ("alpha" in object2) {
      keys.splice(keys.indexOf("alpha"), 1);
      this.valpha = typeof object2.alpha === "number" ? object2.alpha : 0;
    }
    const hashedKeys = keys.sort().join("");
    if (!(hashedKeys in hashedModelKeys)) {
      throw new Error("Unable to parse color from object: " + JSON.stringify(object2));
    }
    this.model = hashedModelKeys[hashedKeys];
    const { labels } = color_convert_default[this.model];
    const color2 = [];
    for (i = 0; i < labels.length; i++) {
      color2.push(object2[labels[i]]);
    }
    this.color = zeroArray(color2);
  }
  if (limiters[this.model]) {
    channels = color_convert_default[this.model].channels;
    for (i = 0; i < channels; i++) {
      const limit = limiters[this.model][i];
      if (limit) {
        this.color[i] = limit(this.color[i]);
      }
    }
  }
  this.valpha = Math.max(0, Math.min(1, this.valpha));
  if (Object.freeze) {
    Object.freeze(this);
  }
}
Color.prototype = {
  toString() {
    return this.string();
  },
  toJSON() {
    return this[this.model]();
  },
  string(places) {
    let self = this.model in color_string_default.to ? this : this.rgb();
    self = self.round(typeof places === "number" ? places : 1);
    const arguments_ = self.valpha === 1 ? self.color : [...self.color, this.valpha];
    return color_string_default.to[self.model](...arguments_);
  },
  percentString(places) {
    const self = this.rgb().round(typeof places === "number" ? places : 1);
    const arguments_ = self.valpha === 1 ? self.color : [...self.color, this.valpha];
    return color_string_default.to.rgb.percent(...arguments_);
  },
  array() {
    return this.valpha === 1 ? [...this.color] : [...this.color, this.valpha];
  },
  object() {
    const result = {};
    const { channels } = color_convert_default[this.model];
    const { labels } = color_convert_default[this.model];
    for (let i = 0; i < channels; i++) {
      result[labels[i]] = this.color[i];
    }
    if (this.valpha !== 1) {
      result.alpha = this.valpha;
    }
    return result;
  },
  unitArray() {
    const rgb = this.rgb().color;
    rgb[0] /= 255;
    rgb[1] /= 255;
    rgb[2] /= 255;
    if (this.valpha !== 1) {
      rgb.push(this.valpha);
    }
    return rgb;
  },
  unitObject() {
    const rgb = this.rgb().object();
    rgb.r /= 255;
    rgb.g /= 255;
    rgb.b /= 255;
    if (this.valpha !== 1) {
      rgb.alpha = this.valpha;
    }
    return rgb;
  },
  round(places) {
    places = Math.max(places || 0, 0);
    return new Color([...this.color.map(roundToPlace(places)), this.valpha], this.model);
  },
  alpha(value) {
    if (value !== void 0) {
      return new Color([...this.color, Math.max(0, Math.min(1, value))], this.model);
    }
    return this.valpha;
  },
  // Rgb
  red: getset("rgb", 0, maxfn(255)),
  green: getset("rgb", 1, maxfn(255)),
  blue: getset("rgb", 2, maxfn(255)),
  hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, (value) => (value % 360 + 360) % 360),
  saturationl: getset("hsl", 1, maxfn(100)),
  lightness: getset("hsl", 2, maxfn(100)),
  saturationv: getset("hsv", 1, maxfn(100)),
  value: getset("hsv", 2, maxfn(100)),
  chroma: getset("hcg", 1, maxfn(100)),
  gray: getset("hcg", 2, maxfn(100)),
  white: getset("hwb", 1, maxfn(100)),
  wblack: getset("hwb", 2, maxfn(100)),
  cyan: getset("cmyk", 0, maxfn(100)),
  magenta: getset("cmyk", 1, maxfn(100)),
  yellow: getset("cmyk", 2, maxfn(100)),
  black: getset("cmyk", 3, maxfn(100)),
  x: getset("xyz", 0, maxfn(95.047)),
  y: getset("xyz", 1, maxfn(100)),
  z: getset("xyz", 2, maxfn(108.833)),
  l: getset("lab", 0, maxfn(100)),
  a: getset("lab", 1),
  b: getset("lab", 2),
  keyword(value) {
    if (value !== void 0) {
      return new Color(value);
    }
    return color_convert_default[this.model].keyword(this.color);
  },
  hex(value) {
    if (value !== void 0) {
      return new Color(value);
    }
    return color_string_default.to.hex(...this.rgb().round().color);
  },
  hexa(value) {
    if (value !== void 0) {
      return new Color(value);
    }
    const rgbArray = this.rgb().round().color;
    let alphaHex = Math.round(this.valpha * 255).toString(16).toUpperCase();
    if (alphaHex.length === 1) {
      alphaHex = "0" + alphaHex;
    }
    return color_string_default.to.hex(...rgbArray) + alphaHex;
  },
  rgbNumber() {
    const rgb = this.rgb().color;
    return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
  },
  luminosity() {
    const rgb = this.rgb().color;
    const lum = [];
    for (const [i, element] of rgb.entries()) {
      const chan = element / 255;
      lum[i] = chan <= 0.04045 ? chan / 12.92 : ((chan + 0.055) / 1.055) ** 2.4;
    }
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  },
  contrast(color2) {
    const lum1 = this.luminosity();
    const lum2 = color2.luminosity();
    if (lum1 > lum2) {
      return (lum1 + 0.05) / (lum2 + 0.05);
    }
    return (lum2 + 0.05) / (lum1 + 0.05);
  },
  level(color2) {
    const contrastRatio = this.contrast(color2);
    if (contrastRatio >= 7) {
      return "AAA";
    }
    return contrastRatio >= 4.5 ? "AA" : "";
  },
  isDark() {
    const rgb = this.rgb().color;
    const yiq = (rgb[0] * 2126 + rgb[1] * 7152 + rgb[2] * 722) / 1e4;
    return yiq < 128;
  },
  isLight() {
    return !this.isDark();
  },
  negate() {
    const rgb = this.rgb();
    for (let i = 0; i < 3; i++) {
      rgb.color[i] = 255 - rgb.color[i];
    }
    return rgb;
  },
  lighten(ratio) {
    const hsl = this.hsl();
    hsl.color[2] += hsl.color[2] * ratio;
    return hsl;
  },
  darken(ratio) {
    const hsl = this.hsl();
    hsl.color[2] -= hsl.color[2] * ratio;
    return hsl;
  },
  saturate(ratio) {
    const hsl = this.hsl();
    hsl.color[1] += hsl.color[1] * ratio;
    return hsl;
  },
  desaturate(ratio) {
    const hsl = this.hsl();
    hsl.color[1] -= hsl.color[1] * ratio;
    return hsl;
  },
  whiten(ratio) {
    const hwb = this.hwb();
    hwb.color[1] += hwb.color[1] * ratio;
    return hwb;
  },
  blacken(ratio) {
    const hwb = this.hwb();
    hwb.color[2] += hwb.color[2] * ratio;
    return hwb;
  },
  grayscale() {
    const rgb = this.rgb().color;
    const value = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
    return Color.rgb(value, value, value);
  },
  fade(ratio) {
    return this.alpha(this.valpha - this.valpha * ratio);
  },
  opaquer(ratio) {
    return this.alpha(this.valpha + this.valpha * ratio);
  },
  rotate(degrees) {
    const hsl = this.hsl();
    let hue = hsl.color[0];
    hue = (hue + degrees) % 360;
    hue = hue < 0 ? 360 + hue : hue;
    hsl.color[0] = hue;
    return hsl;
  },
  mix(mixinColor, weight) {
    if (!mixinColor || !mixinColor.rgb) {
      throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
    }
    const color1 = mixinColor.rgb();
    const color2 = this.rgb();
    const p = weight === void 0 ? 0.5 : weight;
    const w = 2 * p - 1;
    const a = color1.alpha() - color2.alpha();
    const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
    const w2 = 1 - w1;
    return Color.rgb(
      w1 * color1.red() + w2 * color2.red(),
      w1 * color1.green() + w2 * color2.green(),
      w1 * color1.blue() + w2 * color2.blue(),
      color1.alpha() * p + color2.alpha() * (1 - p)
    );
  }
};
for (const model of Object.keys(color_convert_default)) {
  if (skippedModels.includes(model)) {
    continue;
  }
  const { channels } = color_convert_default[model];
  Color.prototype[model] = function(...arguments_) {
    if (this.model === model) {
      return new Color(this);
    }
    if (arguments_.length > 0) {
      return new Color(arguments_, model);
    }
    return new Color([...assertArray(color_convert_default[this.model][model].raw(this.color)), this.valpha], model);
  };
  Color[model] = function(...arguments_) {
    let color2 = arguments_[0];
    if (typeof color2 === "number") {
      color2 = zeroArray(arguments_, channels);
    }
    return new Color(color2, model);
  };
}
function roundTo(number2, places) {
  return Number(number2.toFixed(places));
}
function roundToPlace(places) {
  return function(number2) {
    return roundTo(number2, places);
  };
}
function getset(model, channel2, modifier) {
  model = Array.isArray(model) ? model : [model];
  for (const m of model) {
    (limiters[m] || (limiters[m] = []))[channel2] = modifier;
  }
  model = model[0];
  return function(value) {
    let result;
    if (value !== void 0) {
      if (modifier) {
        value = modifier(value);
      }
      result = this[model]();
      result.color[channel2] = value;
      return result;
    }
    result = this[model]().color[channel2];
    if (modifier) {
      result = modifier(result);
    }
    return result;
  };
}
function maxfn(max) {
  return function(v) {
    return Math.max(0, Math.min(max, v));
  };
}
function assertArray(value) {
  return Array.isArray(value) ? value : [value];
}
function zeroArray(array, length) {
  for (let i = 0; i < length; i++) {
    if (typeof array[i] !== "number") {
      array[i] = 0;
    }
  }
  return array;
}
var index_default = Color;
var colour$1 = color$1.default;
const color = colour$1;
const is$3 = is$9;
const colourspace = {
  multiband: "multiband",
  "b-w": "b-w",
  bw: "b-w",
  cmyk: "cmyk",
  srgb: "srgb"
};
function tint(tint2) {
  this._setBackgroundColourOption("tint", tint2);
  return this;
}
function greyscale(greyscale2) {
  this.options.greyscale = is$3.bool(greyscale2) ? greyscale2 : true;
  return this;
}
function grayscale(grayscale2) {
  return this.greyscale(grayscale2);
}
function pipelineColourspace(colourspace2) {
  if (!is$3.string(colourspace2)) {
    throw is$3.invalidParameterError("colourspace", "string", colourspace2);
  }
  this.options.colourspacePipeline = colourspace2;
  return this;
}
function pipelineColorspace(colorspace) {
  return this.pipelineColourspace(colorspace);
}
function toColourspace(colourspace2) {
  if (!is$3.string(colourspace2)) {
    throw is$3.invalidParameterError("colourspace", "string", colourspace2);
  }
  this.options.colourspace = colourspace2;
  return this;
}
function toColorspace(colorspace) {
  return this.toColourspace(colorspace);
}
function _getBackgroundColourOption(value) {
  if (is$3.object(value) || is$3.string(value)) {
    const colour2 = color(value);
    return [
      colour2.red(),
      colour2.green(),
      colour2.blue(),
      Math.round(colour2.alpha() * 255)
    ];
  } else {
    throw is$3.invalidParameterError("background", "object or string", value);
  }
}
function _setBackgroundColourOption(key, value) {
  if (is$3.defined(value)) {
    this.options[key] = _getBackgroundColourOption(value);
  }
}
var colour = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    // Public
    tint,
    greyscale,
    grayscale,
    pipelineColourspace,
    pipelineColorspace,
    toColourspace,
    toColorspace,
    // Private
    _getBackgroundColourOption,
    _setBackgroundColourOption
  });
  Sharp2.colourspace = colourspace;
  Sharp2.colorspace = colourspace;
};
const is$2 = is$9;
const bool = {
  and: "and",
  or: "or",
  eor: "eor"
};
function removeAlpha() {
  this.options.removeAlpha = true;
  return this;
}
function ensureAlpha(alpha) {
  if (is$2.defined(alpha)) {
    if (is$2.number(alpha) && is$2.inRange(alpha, 0, 1)) {
      this.options.ensureAlpha = alpha;
    } else {
      throw is$2.invalidParameterError("alpha", "number between 0 and 1", alpha);
    }
  } else {
    this.options.ensureAlpha = 1;
  }
  return this;
}
function extractChannel(channel2) {
  const channelMap = { red: 0, green: 1, blue: 2, alpha: 3 };
  if (Object.keys(channelMap).includes(channel2)) {
    channel2 = channelMap[channel2];
  }
  if (is$2.integer(channel2) && is$2.inRange(channel2, 0, 4)) {
    this.options.extractChannel = channel2;
  } else {
    throw is$2.invalidParameterError("channel", "integer or one of: red, green, blue, alpha", channel2);
  }
  return this;
}
function joinChannel(images, options) {
  if (Array.isArray(images)) {
    images.forEach(function(image) {
      this.options.joinChannelIn.push(this._createInputDescriptor(image, options));
    }, this);
  } else {
    this.options.joinChannelIn.push(this._createInputDescriptor(images, options));
  }
  return this;
}
function bandbool(boolOp) {
  if (is$2.string(boolOp) && is$2.inArray(boolOp, ["and", "or", "eor"])) {
    this.options.bandBoolOp = boolOp;
  } else {
    throw is$2.invalidParameterError("boolOp", "one of: and, or, eor", boolOp);
  }
  return this;
}
var channel = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    // Public instance functions
    removeAlpha,
    ensureAlpha,
    extractChannel,
    joinChannel,
    bandbool
  });
  Sharp2.bool = bool;
};
const path = path$4;
const is$1 = is$9;
const sharp$2 = sharpExports;
const formats = /* @__PURE__ */ new Map([
  ["heic", "heif"],
  ["heif", "heif"],
  ["avif", "avif"],
  ["jpeg", "jpeg"],
  ["jpg", "jpeg"],
  ["jpe", "jpeg"],
  ["tile", "tile"],
  ["dz", "tile"],
  ["png", "png"],
  ["raw", "raw"],
  ["tiff", "tiff"],
  ["tif", "tiff"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["jp2", "jp2"],
  ["jpx", "jp2"],
  ["j2k", "jp2"],
  ["j2c", "jp2"],
  ["jxl", "jxl"]
]);
const jp2Regex = /\.(jp[2x]|j2[kc])$/i;
const errJp2Save = () => new Error("JP2 output requires libvips with support for OpenJPEG");
const bitdepthFromColourCount = (colours) => 1 << 31 - Math.clz32(Math.ceil(Math.log2(colours)));
function toFile(fileOut, callback) {
  let err;
  if (!is$1.string(fileOut)) {
    err = new Error("Missing output file path");
  } else if (is$1.string(this.options.input.file) && path.resolve(this.options.input.file) === path.resolve(fileOut)) {
    err = new Error("Cannot use same file for input and output");
  } else if (jp2Regex.test(path.extname(fileOut)) && !this.constructor.format.jp2k.output.file) {
    err = errJp2Save();
  }
  if (err) {
    if (is$1.fn(callback)) {
      callback(err);
    } else {
      return Promise.reject(err);
    }
  } else {
    this.options.fileOut = fileOut;
    const stack = Error();
    return this._pipeline(callback, stack);
  }
  return this;
}
function toBuffer(options, callback) {
  if (is$1.object(options)) {
    this._setBooleanOption("resolveWithObject", options.resolveWithObject);
  } else if (this.options.resolveWithObject) {
    this.options.resolveWithObject = false;
  }
  this.options.fileOut = "";
  const stack = Error();
  return this._pipeline(is$1.fn(options) ? options : callback, stack);
}
function keepExif() {
  this.options.keepMetadata |= 1;
  return this;
}
function withExif(exif) {
  if (is$1.object(exif)) {
    for (const [ifd, entries] of Object.entries(exif)) {
      if (is$1.object(entries)) {
        for (const [k, v] of Object.entries(entries)) {
          if (is$1.string(v)) {
            this.options.withExif[`exif-${ifd.toLowerCase()}-${k}`] = v;
          } else {
            throw is$1.invalidParameterError(`${ifd}.${k}`, "string", v);
          }
        }
      } else {
        throw is$1.invalidParameterError(ifd, "object", entries);
      }
    }
  } else {
    throw is$1.invalidParameterError("exif", "object", exif);
  }
  this.options.withExifMerge = false;
  return this.keepExif();
}
function withExifMerge(exif) {
  this.withExif(exif);
  this.options.withExifMerge = true;
  return this;
}
function keepIccProfile() {
  this.options.keepMetadata |= 8;
  return this;
}
function withIccProfile(icc, options) {
  if (is$1.string(icc)) {
    this.options.withIccProfile = icc;
  } else {
    throw is$1.invalidParameterError("icc", "string", icc);
  }
  this.keepIccProfile();
  if (is$1.object(options)) {
    if (is$1.defined(options.attach)) {
      if (is$1.bool(options.attach)) {
        if (!options.attach) {
          this.options.keepMetadata &= -9;
        }
      } else {
        throw is$1.invalidParameterError("attach", "boolean", options.attach);
      }
    }
  }
  return this;
}
function keepXmp() {
  this.options.keepMetadata |= 2;
  return this;
}
function withXmp(xmp) {
  if (is$1.string(xmp) && xmp.length > 0) {
    this.options.withXmp = xmp;
    this.options.keepMetadata |= 2;
  } else {
    throw is$1.invalidParameterError("xmp", "non-empty string", xmp);
  }
  return this;
}
function keepMetadata() {
  this.options.keepMetadata = 31;
  return this;
}
function withMetadata(options) {
  this.keepMetadata();
  this.withIccProfile("srgb");
  if (is$1.object(options)) {
    if (is$1.defined(options.orientation)) {
      if (is$1.integer(options.orientation) && is$1.inRange(options.orientation, 1, 8)) {
        this.options.withMetadataOrientation = options.orientation;
      } else {
        throw is$1.invalidParameterError("orientation", "integer between 1 and 8", options.orientation);
      }
    }
    if (is$1.defined(options.density)) {
      if (is$1.number(options.density) && options.density > 0) {
        this.options.withMetadataDensity = options.density;
      } else {
        throw is$1.invalidParameterError("density", "positive number", options.density);
      }
    }
    if (is$1.defined(options.icc)) {
      this.withIccProfile(options.icc);
    }
    if (is$1.defined(options.exif)) {
      this.withExifMerge(options.exif);
    }
  }
  return this;
}
function toFormat(format2, options) {
  const actualFormat = formats.get((is$1.object(format2) && is$1.string(format2.id) ? format2.id : format2).toLowerCase());
  if (!actualFormat) {
    throw is$1.invalidParameterError("format", `one of: ${[...formats.keys()].join(", ")}`, format2);
  }
  return this[actualFormat](options);
}
function jpeg(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.jpegQuality = options.quality;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    }
    if (is$1.defined(options.progressive)) {
      this._setBooleanOption("jpegProgressive", options.progressive);
    }
    if (is$1.defined(options.chromaSubsampling)) {
      if (is$1.string(options.chromaSubsampling) && is$1.inArray(options.chromaSubsampling, ["4:2:0", "4:4:4"])) {
        this.options.jpegChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is$1.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", options.chromaSubsampling);
      }
    }
    const optimiseCoding = is$1.bool(options.optimizeCoding) ? options.optimizeCoding : options.optimiseCoding;
    if (is$1.defined(optimiseCoding)) {
      this._setBooleanOption("jpegOptimiseCoding", optimiseCoding);
    }
    if (is$1.defined(options.mozjpeg)) {
      if (is$1.bool(options.mozjpeg)) {
        if (options.mozjpeg) {
          this.options.jpegTrellisQuantisation = true;
          this.options.jpegOvershootDeringing = true;
          this.options.jpegOptimiseScans = true;
          this.options.jpegProgressive = true;
          this.options.jpegQuantisationTable = 3;
        }
      } else {
        throw is$1.invalidParameterError("mozjpeg", "boolean", options.mozjpeg);
      }
    }
    const trellisQuantisation = is$1.bool(options.trellisQuantization) ? options.trellisQuantization : options.trellisQuantisation;
    if (is$1.defined(trellisQuantisation)) {
      this._setBooleanOption("jpegTrellisQuantisation", trellisQuantisation);
    }
    if (is$1.defined(options.overshootDeringing)) {
      this._setBooleanOption("jpegOvershootDeringing", options.overshootDeringing);
    }
    const optimiseScans = is$1.bool(options.optimizeScans) ? options.optimizeScans : options.optimiseScans;
    if (is$1.defined(optimiseScans)) {
      this._setBooleanOption("jpegOptimiseScans", optimiseScans);
      if (optimiseScans) {
        this.options.jpegProgressive = true;
      }
    }
    const quantisationTable = is$1.number(options.quantizationTable) ? options.quantizationTable : options.quantisationTable;
    if (is$1.defined(quantisationTable)) {
      if (is$1.integer(quantisationTable) && is$1.inRange(quantisationTable, 0, 8)) {
        this.options.jpegQuantisationTable = quantisationTable;
      } else {
        throw is$1.invalidParameterError("quantisationTable", "integer between 0 and 8", quantisationTable);
      }
    }
  }
  return this._updateFormatOut("jpeg", options);
}
function png(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.progressive)) {
      this._setBooleanOption("pngProgressive", options.progressive);
    }
    if (is$1.defined(options.compressionLevel)) {
      if (is$1.integer(options.compressionLevel) && is$1.inRange(options.compressionLevel, 0, 9)) {
        this.options.pngCompressionLevel = options.compressionLevel;
      } else {
        throw is$1.invalidParameterError("compressionLevel", "integer between 0 and 9", options.compressionLevel);
      }
    }
    if (is$1.defined(options.adaptiveFiltering)) {
      this._setBooleanOption("pngAdaptiveFiltering", options.adaptiveFiltering);
    }
    const colours = options.colours || options.colors;
    if (is$1.defined(colours)) {
      if (is$1.integer(colours) && is$1.inRange(colours, 2, 256)) {
        this.options.pngBitdepth = bitdepthFromColourCount(colours);
      } else {
        throw is$1.invalidParameterError("colours", "integer between 2 and 256", colours);
      }
    }
    if (is$1.defined(options.palette)) {
      this._setBooleanOption("pngPalette", options.palette);
    } else if ([options.quality, options.effort, options.colours, options.colors, options.dither].some(is$1.defined)) {
      this._setBooleanOption("pngPalette", true);
    }
    if (this.options.pngPalette) {
      if (is$1.defined(options.quality)) {
        if (is$1.integer(options.quality) && is$1.inRange(options.quality, 0, 100)) {
          this.options.pngQuality = options.quality;
        } else {
          throw is$1.invalidParameterError("quality", "integer between 0 and 100", options.quality);
        }
      }
      if (is$1.defined(options.effort)) {
        if (is$1.integer(options.effort) && is$1.inRange(options.effort, 1, 10)) {
          this.options.pngEffort = options.effort;
        } else {
          throw is$1.invalidParameterError("effort", "integer between 1 and 10", options.effort);
        }
      }
      if (is$1.defined(options.dither)) {
        if (is$1.number(options.dither) && is$1.inRange(options.dither, 0, 1)) {
          this.options.pngDither = options.dither;
        } else {
          throw is$1.invalidParameterError("dither", "number between 0.0 and 1.0", options.dither);
        }
      }
    }
  }
  return this._updateFormatOut("png", options);
}
function webp(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.webpQuality = options.quality;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    }
    if (is$1.defined(options.alphaQuality)) {
      if (is$1.integer(options.alphaQuality) && is$1.inRange(options.alphaQuality, 0, 100)) {
        this.options.webpAlphaQuality = options.alphaQuality;
      } else {
        throw is$1.invalidParameterError("alphaQuality", "integer between 0 and 100", options.alphaQuality);
      }
    }
    if (is$1.defined(options.lossless)) {
      this._setBooleanOption("webpLossless", options.lossless);
    }
    if (is$1.defined(options.nearLossless)) {
      this._setBooleanOption("webpNearLossless", options.nearLossless);
    }
    if (is$1.defined(options.smartSubsample)) {
      this._setBooleanOption("webpSmartSubsample", options.smartSubsample);
    }
    if (is$1.defined(options.smartDeblock)) {
      this._setBooleanOption("webpSmartDeblock", options.smartDeblock);
    }
    if (is$1.defined(options.preset)) {
      if (is$1.string(options.preset) && is$1.inArray(options.preset, ["default", "photo", "picture", "drawing", "icon", "text"])) {
        this.options.webpPreset = options.preset;
      } else {
        throw is$1.invalidParameterError("preset", "one of: default, photo, picture, drawing, icon, text", options.preset);
      }
    }
    if (is$1.defined(options.effort)) {
      if (is$1.integer(options.effort) && is$1.inRange(options.effort, 0, 6)) {
        this.options.webpEffort = options.effort;
      } else {
        throw is$1.invalidParameterError("effort", "integer between 0 and 6", options.effort);
      }
    }
    if (is$1.defined(options.minSize)) {
      this._setBooleanOption("webpMinSize", options.minSize);
    }
    if (is$1.defined(options.mixed)) {
      this._setBooleanOption("webpMixed", options.mixed);
    }
  }
  trySetAnimationOptions(options, this.options);
  return this._updateFormatOut("webp", options);
}
function gif(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.reuse)) {
      this._setBooleanOption("gifReuse", options.reuse);
    }
    if (is$1.defined(options.progressive)) {
      this._setBooleanOption("gifProgressive", options.progressive);
    }
    const colours = options.colours || options.colors;
    if (is$1.defined(colours)) {
      if (is$1.integer(colours) && is$1.inRange(colours, 2, 256)) {
        this.options.gifBitdepth = bitdepthFromColourCount(colours);
      } else {
        throw is$1.invalidParameterError("colours", "integer between 2 and 256", colours);
      }
    }
    if (is$1.defined(options.effort)) {
      if (is$1.number(options.effort) && is$1.inRange(options.effort, 1, 10)) {
        this.options.gifEffort = options.effort;
      } else {
        throw is$1.invalidParameterError("effort", "integer between 1 and 10", options.effort);
      }
    }
    if (is$1.defined(options.dither)) {
      if (is$1.number(options.dither) && is$1.inRange(options.dither, 0, 1)) {
        this.options.gifDither = options.dither;
      } else {
        throw is$1.invalidParameterError("dither", "number between 0.0 and 1.0", options.dither);
      }
    }
    if (is$1.defined(options.interFrameMaxError)) {
      if (is$1.number(options.interFrameMaxError) && is$1.inRange(options.interFrameMaxError, 0, 32)) {
        this.options.gifInterFrameMaxError = options.interFrameMaxError;
      } else {
        throw is$1.invalidParameterError("interFrameMaxError", "number between 0.0 and 32.0", options.interFrameMaxError);
      }
    }
    if (is$1.defined(options.interPaletteMaxError)) {
      if (is$1.number(options.interPaletteMaxError) && is$1.inRange(options.interPaletteMaxError, 0, 256)) {
        this.options.gifInterPaletteMaxError = options.interPaletteMaxError;
      } else {
        throw is$1.invalidParameterError("interPaletteMaxError", "number between 0.0 and 256.0", options.interPaletteMaxError);
      }
    }
    if (is$1.defined(options.keepDuplicateFrames)) {
      if (is$1.bool(options.keepDuplicateFrames)) {
        this._setBooleanOption("gifKeepDuplicateFrames", options.keepDuplicateFrames);
      } else {
        throw is$1.invalidParameterError("keepDuplicateFrames", "boolean", options.keepDuplicateFrames);
      }
    }
  }
  trySetAnimationOptions(options, this.options);
  return this._updateFormatOut("gif", options);
}
function jp2(options) {
  if (!this.constructor.format.jp2k.output.buffer) {
    throw errJp2Save();
  }
  if (is$1.object(options)) {
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.jp2Quality = options.quality;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    }
    if (is$1.defined(options.lossless)) {
      if (is$1.bool(options.lossless)) {
        this.options.jp2Lossless = options.lossless;
      } else {
        throw is$1.invalidParameterError("lossless", "boolean", options.lossless);
      }
    }
    if (is$1.defined(options.tileWidth)) {
      if (is$1.integer(options.tileWidth) && is$1.inRange(options.tileWidth, 1, 32768)) {
        this.options.jp2TileWidth = options.tileWidth;
      } else {
        throw is$1.invalidParameterError("tileWidth", "integer between 1 and 32768", options.tileWidth);
      }
    }
    if (is$1.defined(options.tileHeight)) {
      if (is$1.integer(options.tileHeight) && is$1.inRange(options.tileHeight, 1, 32768)) {
        this.options.jp2TileHeight = options.tileHeight;
      } else {
        throw is$1.invalidParameterError("tileHeight", "integer between 1 and 32768", options.tileHeight);
      }
    }
    if (is$1.defined(options.chromaSubsampling)) {
      if (is$1.string(options.chromaSubsampling) && is$1.inArray(options.chromaSubsampling, ["4:2:0", "4:4:4"])) {
        this.options.jp2ChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is$1.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", options.chromaSubsampling);
      }
    }
  }
  return this._updateFormatOut("jp2", options);
}
function trySetAnimationOptions(source, target) {
  if (is$1.object(source) && is$1.defined(source.loop)) {
    if (is$1.integer(source.loop) && is$1.inRange(source.loop, 0, 65535)) {
      target.loop = source.loop;
    } else {
      throw is$1.invalidParameterError("loop", "integer between 0 and 65535", source.loop);
    }
  }
  if (is$1.object(source) && is$1.defined(source.delay)) {
    if (is$1.integer(source.delay) && is$1.inRange(source.delay, 0, 65535)) {
      target.delay = [source.delay];
    } else if (Array.isArray(source.delay) && source.delay.every(is$1.integer) && source.delay.every((v) => is$1.inRange(v, 0, 65535))) {
      target.delay = source.delay;
    } else {
      throw is$1.invalidParameterError("delay", "integer or an array of integers between 0 and 65535", source.delay);
    }
  }
}
function tiff(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.tiffQuality = options.quality;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    }
    if (is$1.defined(options.bitdepth)) {
      if (is$1.integer(options.bitdepth) && is$1.inArray(options.bitdepth, [1, 2, 4, 8])) {
        this.options.tiffBitdepth = options.bitdepth;
      } else {
        throw is$1.invalidParameterError("bitdepth", "1, 2, 4 or 8", options.bitdepth);
      }
    }
    if (is$1.defined(options.tile)) {
      this._setBooleanOption("tiffTile", options.tile);
    }
    if (is$1.defined(options.tileWidth)) {
      if (is$1.integer(options.tileWidth) && options.tileWidth > 0) {
        this.options.tiffTileWidth = options.tileWidth;
      } else {
        throw is$1.invalidParameterError("tileWidth", "integer greater than zero", options.tileWidth);
      }
    }
    if (is$1.defined(options.tileHeight)) {
      if (is$1.integer(options.tileHeight) && options.tileHeight > 0) {
        this.options.tiffTileHeight = options.tileHeight;
      } else {
        throw is$1.invalidParameterError("tileHeight", "integer greater than zero", options.tileHeight);
      }
    }
    if (is$1.defined(options.miniswhite)) {
      this._setBooleanOption("tiffMiniswhite", options.miniswhite);
    }
    if (is$1.defined(options.pyramid)) {
      this._setBooleanOption("tiffPyramid", options.pyramid);
    }
    if (is$1.defined(options.xres)) {
      if (is$1.number(options.xres) && options.xres > 0) {
        this.options.tiffXres = options.xres;
      } else {
        throw is$1.invalidParameterError("xres", "number greater than zero", options.xres);
      }
    }
    if (is$1.defined(options.yres)) {
      if (is$1.number(options.yres) && options.yres > 0) {
        this.options.tiffYres = options.yres;
      } else {
        throw is$1.invalidParameterError("yres", "number greater than zero", options.yres);
      }
    }
    if (is$1.defined(options.compression)) {
      if (is$1.string(options.compression) && is$1.inArray(options.compression, ["none", "jpeg", "deflate", "packbits", "ccittfax4", "lzw", "webp", "zstd", "jp2k"])) {
        this.options.tiffCompression = options.compression;
      } else {
        throw is$1.invalidParameterError("compression", "one of: none, jpeg, deflate, packbits, ccittfax4, lzw, webp, zstd, jp2k", options.compression);
      }
    }
    if (is$1.defined(options.predictor)) {
      if (is$1.string(options.predictor) && is$1.inArray(options.predictor, ["none", "horizontal", "float"])) {
        this.options.tiffPredictor = options.predictor;
      } else {
        throw is$1.invalidParameterError("predictor", "one of: none, horizontal, float", options.predictor);
      }
    }
    if (is$1.defined(options.resolutionUnit)) {
      if (is$1.string(options.resolutionUnit) && is$1.inArray(options.resolutionUnit, ["inch", "cm"])) {
        this.options.tiffResolutionUnit = options.resolutionUnit;
      } else {
        throw is$1.invalidParameterError("resolutionUnit", "one of: inch, cm", options.resolutionUnit);
      }
    }
  }
  return this._updateFormatOut("tiff", options);
}
function avif(options) {
  return this.heif({ ...options, compression: "av1" });
}
function heif(options) {
  if (is$1.object(options)) {
    if (is$1.string(options.compression) && is$1.inArray(options.compression, ["av1", "hevc"])) {
      this.options.heifCompression = options.compression;
    } else {
      throw is$1.invalidParameterError("compression", "one of: av1, hevc", options.compression);
    }
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.heifQuality = options.quality;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    }
    if (is$1.defined(options.lossless)) {
      if (is$1.bool(options.lossless)) {
        this.options.heifLossless = options.lossless;
      } else {
        throw is$1.invalidParameterError("lossless", "boolean", options.lossless);
      }
    }
    if (is$1.defined(options.effort)) {
      if (is$1.integer(options.effort) && is$1.inRange(options.effort, 0, 9)) {
        this.options.heifEffort = options.effort;
      } else {
        throw is$1.invalidParameterError("effort", "integer between 0 and 9", options.effort);
      }
    }
    if (is$1.defined(options.chromaSubsampling)) {
      if (is$1.string(options.chromaSubsampling) && is$1.inArray(options.chromaSubsampling, ["4:2:0", "4:4:4"])) {
        this.options.heifChromaSubsampling = options.chromaSubsampling;
      } else {
        throw is$1.invalidParameterError("chromaSubsampling", "one of: 4:2:0, 4:4:4", options.chromaSubsampling);
      }
    }
    if (is$1.defined(options.bitdepth)) {
      if (is$1.integer(options.bitdepth) && is$1.inArray(options.bitdepth, [8, 10, 12])) {
        if (options.bitdepth !== 8 && this.constructor.versions.heif) {
          throw is$1.invalidParameterError("bitdepth when using prebuilt binaries", 8, options.bitdepth);
        }
        this.options.heifBitdepth = options.bitdepth;
      } else {
        throw is$1.invalidParameterError("bitdepth", "8, 10 or 12", options.bitdepth);
      }
    }
  } else {
    throw is$1.invalidParameterError("options", "Object", options);
  }
  return this._updateFormatOut("heif", options);
}
function jxl(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.quality)) {
      if (is$1.integer(options.quality) && is$1.inRange(options.quality, 1, 100)) {
        this.options.jxlDistance = options.quality >= 30 ? 0.1 + (100 - options.quality) * 0.09 : 53 / 3e3 * options.quality * options.quality - 23 / 20 * options.quality + 25;
      } else {
        throw is$1.invalidParameterError("quality", "integer between 1 and 100", options.quality);
      }
    } else if (is$1.defined(options.distance)) {
      if (is$1.number(options.distance) && is$1.inRange(options.distance, 0, 15)) {
        this.options.jxlDistance = options.distance;
      } else {
        throw is$1.invalidParameterError("distance", "number between 0.0 and 15.0", options.distance);
      }
    }
    if (is$1.defined(options.decodingTier)) {
      if (is$1.integer(options.decodingTier) && is$1.inRange(options.decodingTier, 0, 4)) {
        this.options.jxlDecodingTier = options.decodingTier;
      } else {
        throw is$1.invalidParameterError("decodingTier", "integer between 0 and 4", options.decodingTier);
      }
    }
    if (is$1.defined(options.lossless)) {
      if (is$1.bool(options.lossless)) {
        this.options.jxlLossless = options.lossless;
      } else {
        throw is$1.invalidParameterError("lossless", "boolean", options.lossless);
      }
    }
    if (is$1.defined(options.effort)) {
      if (is$1.integer(options.effort) && is$1.inRange(options.effort, 1, 9)) {
        this.options.jxlEffort = options.effort;
      } else {
        throw is$1.invalidParameterError("effort", "integer between 1 and 9", options.effort);
      }
    }
  }
  trySetAnimationOptions(options, this.options);
  return this._updateFormatOut("jxl", options);
}
function raw(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.depth)) {
      if (is$1.string(options.depth) && is$1.inArray(
        options.depth,
        ["char", "uchar", "short", "ushort", "int", "uint", "float", "complex", "double", "dpcomplex"]
      )) {
        this.options.rawDepth = options.depth;
      } else {
        throw is$1.invalidParameterError("depth", "one of: char, uchar, short, ushort, int, uint, float, complex, double, dpcomplex", options.depth);
      }
    }
  }
  return this._updateFormatOut("raw");
}
function tile(options) {
  if (is$1.object(options)) {
    if (is$1.defined(options.size)) {
      if (is$1.integer(options.size) && is$1.inRange(options.size, 1, 8192)) {
        this.options.tileSize = options.size;
      } else {
        throw is$1.invalidParameterError("size", "integer between 1 and 8192", options.size);
      }
    }
    if (is$1.defined(options.overlap)) {
      if (is$1.integer(options.overlap) && is$1.inRange(options.overlap, 0, 8192)) {
        if (options.overlap > this.options.tileSize) {
          throw is$1.invalidParameterError("overlap", `<= size (${this.options.tileSize})`, options.overlap);
        }
        this.options.tileOverlap = options.overlap;
      } else {
        throw is$1.invalidParameterError("overlap", "integer between 0 and 8192", options.overlap);
      }
    }
    if (is$1.defined(options.container)) {
      if (is$1.string(options.container) && is$1.inArray(options.container, ["fs", "zip"])) {
        this.options.tileContainer = options.container;
      } else {
        throw is$1.invalidParameterError("container", "one of: fs, zip", options.container);
      }
    }
    if (is$1.defined(options.layout)) {
      if (is$1.string(options.layout) && is$1.inArray(options.layout, ["dz", "google", "iiif", "iiif3", "zoomify"])) {
        this.options.tileLayout = options.layout;
      } else {
        throw is$1.invalidParameterError("layout", "one of: dz, google, iiif, iiif3, zoomify", options.layout);
      }
    }
    if (is$1.defined(options.angle)) {
      if (is$1.integer(options.angle) && !(options.angle % 90)) {
        this.options.tileAngle = options.angle;
      } else {
        throw is$1.invalidParameterError("angle", "positive/negative multiple of 90", options.angle);
      }
    }
    this._setBackgroundColourOption("tileBackground", options.background);
    if (is$1.defined(options.depth)) {
      if (is$1.string(options.depth) && is$1.inArray(options.depth, ["onepixel", "onetile", "one"])) {
        this.options.tileDepth = options.depth;
      } else {
        throw is$1.invalidParameterError("depth", "one of: onepixel, onetile, one", options.depth);
      }
    }
    if (is$1.defined(options.skipBlanks)) {
      if (is$1.integer(options.skipBlanks) && is$1.inRange(options.skipBlanks, -1, 65535)) {
        this.options.tileSkipBlanks = options.skipBlanks;
      } else {
        throw is$1.invalidParameterError("skipBlanks", "integer between -1 and 255/65535", options.skipBlanks);
      }
    } else if (is$1.defined(options.layout) && options.layout === "google") {
      this.options.tileSkipBlanks = 5;
    }
    const centre = is$1.bool(options.center) ? options.center : options.centre;
    if (is$1.defined(centre)) {
      this._setBooleanOption("tileCentre", centre);
    }
    if (is$1.defined(options.id)) {
      if (is$1.string(options.id)) {
        this.options.tileId = options.id;
      } else {
        throw is$1.invalidParameterError("id", "string", options.id);
      }
    }
    if (is$1.defined(options.basename)) {
      if (is$1.string(options.basename)) {
        this.options.tileBasename = options.basename;
      } else {
        throw is$1.invalidParameterError("basename", "string", options.basename);
      }
    }
  }
  if (is$1.inArray(this.options.formatOut, ["jpeg", "png", "webp"])) {
    this.options.tileFormat = this.options.formatOut;
  } else if (this.options.formatOut !== "input") {
    throw is$1.invalidParameterError("format", "one of: jpeg, png, webp", this.options.formatOut);
  }
  return this._updateFormatOut("dz");
}
function timeout(options) {
  if (!is$1.plainObject(options)) {
    throw is$1.invalidParameterError("options", "object", options);
  }
  if (is$1.integer(options.seconds) && is$1.inRange(options.seconds, 0, 3600)) {
    this.options.timeoutSeconds = options.seconds;
  } else {
    throw is$1.invalidParameterError("seconds", "integer between 0 and 3600", options.seconds);
  }
  return this;
}
function _updateFormatOut(formatOut, options) {
  if (!(is$1.object(options) && options.force === false)) {
    this.options.formatOut = formatOut;
  }
  return this;
}
function _setBooleanOption(key, val) {
  if (is$1.bool(val)) {
    this.options[key] = val;
  } else {
    throw is$1.invalidParameterError(key, "boolean", val);
  }
}
function _read() {
  if (!this.options.streamOut) {
    this.options.streamOut = true;
    const stack = Error();
    this._pipeline(void 0, stack);
  }
}
function _pipeline(callback, stack) {
  if (typeof callback === "function") {
    if (this._isStreamInput()) {
      this.on("finish", () => {
        this._flattenBufferIn();
        sharp$2.pipeline(this.options, (err, data, info) => {
          if (err) {
            callback(is$1.nativeError(err, stack));
          } else {
            callback(null, data, info);
          }
        });
      });
    } else {
      sharp$2.pipeline(this.options, (err, data, info) => {
        if (err) {
          callback(is$1.nativeError(err, stack));
        } else {
          callback(null, data, info);
        }
      });
    }
    return this;
  } else if (this.options.streamOut) {
    if (this._isStreamInput()) {
      this.once("finish", () => {
        this._flattenBufferIn();
        sharp$2.pipeline(this.options, (err, data, info) => {
          if (err) {
            this.emit("error", is$1.nativeError(err, stack));
          } else {
            this.emit("info", info);
            this.push(data);
          }
          this.push(null);
          this.on("end", () => this.emit("close"));
        });
      });
      if (this.streamInFinished) {
        this.emit("finish");
      }
    } else {
      sharp$2.pipeline(this.options, (err, data, info) => {
        if (err) {
          this.emit("error", is$1.nativeError(err, stack));
        } else {
          this.emit("info", info);
          this.push(data);
        }
        this.push(null);
        this.on("end", () => this.emit("close"));
      });
    }
    return this;
  } else {
    if (this._isStreamInput()) {
      return new Promise((resolve, reject) => {
        this.once("finish", () => {
          this._flattenBufferIn();
          sharp$2.pipeline(this.options, (err, data, info) => {
            if (err) {
              reject(is$1.nativeError(err, stack));
            } else {
              if (this.options.resolveWithObject) {
                resolve({ data, info });
              } else {
                resolve(data);
              }
            }
          });
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        sharp$2.pipeline(this.options, (err, data, info) => {
          if (err) {
            reject(is$1.nativeError(err, stack));
          } else {
            if (this.options.resolveWithObject) {
              resolve({ data, info });
            } else {
              resolve(data);
            }
          }
        });
      });
    }
  }
}
var output = function(Sharp2) {
  Object.assign(Sharp2.prototype, {
    // Public
    toFile,
    toBuffer,
    keepExif,
    withExif,
    withExifMerge,
    keepIccProfile,
    withIccProfile,
    keepXmp,
    withXmp,
    keepMetadata,
    withMetadata,
    toFormat,
    jpeg,
    jp2,
    png,
    webp,
    tiff,
    avif,
    heif,
    jxl,
    gif,
    raw,
    tile,
    timeout,
    // Private
    _updateFormatOut,
    _setBooleanOption,
    _read,
    _pipeline
  });
};
const events = require$$0$6;
const detectLibc = detectLibc$2;
const is = is$9;
const { runtimePlatformArch } = libvips;
const sharp$1 = sharpExports;
const runtimePlatform = runtimePlatformArch();
const libvipsVersion = sharp$1.libvipsVersion();
const format = sharp$1.format();
format.heif.output.alias = ["avif", "heic"];
format.jpeg.output.alias = ["jpe", "jpg"];
format.tiff.output.alias = ["tif"];
format.jp2k.output.alias = ["j2c", "j2k", "jp2", "jpx"];
const interpolators = {
  /** [Nearest neighbour interpolation](http://en.wikipedia.org/wiki/Nearest-neighbor_interpolation). Suitable for image enlargement only. */
  nearest: "nearest",
  /** [Bilinear interpolation](http://en.wikipedia.org/wiki/Bilinear_interpolation). Faster than bicubic but with less smooth results. */
  bilinear: "bilinear",
  /** [Bicubic interpolation](http://en.wikipedia.org/wiki/Bicubic_interpolation) (the default). */
  bicubic: "bicubic",
  /** [LBB interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/lbb.cpp#L100). Prevents some "[acutance](http://en.wikipedia.org/wiki/Acutance)" but typically reduces performance by a factor of 2. */
  locallyBoundedBicubic: "lbb",
  /** [Nohalo interpolation](http://eprints.soton.ac.uk/268086/). Prevents acutance but typically reduces performance by a factor of 3. */
  nohalo: "nohalo",
  /** [VSQBS interpolation](https://github.com/libvips/libvips/blob/master/libvips/resample/vsqbs.cpp#L48). Prevents "staircasing" when enlarging. */
  vertexSplitQuadraticBasisSpline: "vsqbs"
};
let versions = {
  vips: libvipsVersion.semver
};
if (!libvipsVersion.isGlobal) {
  if (!libvipsVersion.isWasm) {
    try {
      versions = commonjsRequire(`@img/sharp-${runtimePlatform}/versions`);
    } catch (_) {
      try {
        versions = commonjsRequire(`@img/sharp-libvips-${runtimePlatform}/versions`);
      } catch (_2) {
      }
    }
  } else {
    try {
      versions = require("@img/sharp-wasm32/versions");
    } catch (_) {
    }
  }
}
versions.sharp = require$$6.version;
if (versions.heif && format.heif) {
  format.heif.input.fileSuffix = [".avif"];
  format.heif.output.alias = ["avif"];
}
function cache(options) {
  if (is.bool(options)) {
    if (options) {
      return sharp$1.cache(50, 20, 100);
    } else {
      return sharp$1.cache(0, 0, 0);
    }
  } else if (is.object(options)) {
    return sharp$1.cache(options.memory, options.files, options.items);
  } else {
    return sharp$1.cache();
  }
}
cache(true);
function concurrency(concurrency2) {
  return sharp$1.concurrency(is.integer(concurrency2) ? concurrency2 : null);
}
if (detectLibc.familySync() === detectLibc.GLIBC && !sharp$1._isUsingJemalloc()) {
  sharp$1.concurrency(1);
} else if (detectLibc.familySync() === detectLibc.MUSL && sharp$1.concurrency() === 1024) {
  sharp$1.concurrency(os.availableParallelism());
}
const queue = new events.EventEmitter();
function counters() {
  return sharp$1.counters();
}
function simd(simd2) {
  return sharp$1.simd(is.bool(simd2) ? simd2 : null);
}
function block(options) {
  if (is.object(options)) {
    if (Array.isArray(options.operation) && options.operation.every(is.string)) {
      sharp$1.block(options.operation, true);
    } else {
      throw is.invalidParameterError("operation", "Array<string>", options.operation);
    }
  } else {
    throw is.invalidParameterError("options", "object", options);
  }
}
function unblock(options) {
  if (is.object(options)) {
    if (Array.isArray(options.operation) && options.operation.every(is.string)) {
      sharp$1.block(options.operation, false);
    } else {
      throw is.invalidParameterError("operation", "Array<string>", options.operation);
    }
  } else {
    throw is.invalidParameterError("options", "object", options);
  }
}
var utility = function(Sharp2) {
  Sharp2.cache = cache;
  Sharp2.concurrency = concurrency;
  Sharp2.counters = counters;
  Sharp2.simd = simd;
  Sharp2.format = format;
  Sharp2.interpolators = interpolators;
  Sharp2.versions = versions;
  Sharp2.queue = queue;
  Sharp2.block = block;
  Sharp2.unblock = unblock;
};
const Sharp = constructor;
input(Sharp);
resize_1(Sharp);
composite_1(Sharp);
operation(Sharp);
colour(Sharp);
channel(Sharp);
output(Sharp);
utility(Sharp);
var lib = Sharp;
const sharp = /* @__PURE__ */ main.getDefaultExportFromCjs(lib);
const CACHE_DIR = require$$1.join(process.env.APPDATA || process.env.HOME || ".", ".xvser-cache");
main.fs.ensureDirSync(CACHE_DIR);
const VIDEO_EXTENSIONS = /* @__PURE__ */ new Set([".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"]);
const IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]);
async function getImageThumbnail(filePath, options = {}) {
  try {
    const { width = 256, height = 256, quality = 80 } = options;
    const cacheKey = `img_${width}x${height}_${quality}_${filePath.replace(/[^a-z0-9]/gi, "_")}`;
    const cachePath = require$$1.join(CACHE_DIR, cacheKey + ".webp");
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        main.fs.stat(cachePath),
        main.fs.stat(filePath)
      ]);
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await main.fs.readFile(cachePath);
        return `data:image/webp;base64,${cached.toString("base64")}`;
      }
    } catch {
    }
    const image = await sharp(filePath).resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).webp({ quality }).toBuffer();
    await main.fs.writeFile(cachePath, image);
    return `data:image/webp;base64,${image.toString("base64")}`;
  } catch (err) {
    console.error("Failed to generate image thumbnail:", err);
    return null;
  }
}
async function getVideoThumbnail(filePath, options = {}) {
  try {
    const { width = 256, height = 256, quality = 80, timestamp = "00:00:01" } = options;
    const cacheKey = `vid_${width}x${height}_${quality}_${timestamp}_${filePath.replace(/[^a-z0-9]/gi, "_")}`;
    const cachePath = require$$1.join(CACHE_DIR, cacheKey + ".webp");
    try {
      const [cacheStats, sourceStats] = await Promise.all([
        main.fs.stat(cachePath),
        main.fs.stat(filePath)
      ]);
      if (cacheStats.mtimeMs > sourceStats.mtimeMs) {
        const cached = await main.fs.readFile(cachePath);
        return `data:image/webp;base64,${cached.toString("base64")}`;
      }
    } catch {
    }
    const tempPath = require$$1.join(CACHE_DIR, `temp_${Date.now()}.png`);
    await new Promise((resolve, reject) => {
      ffmpeg(filePath).on("end", resolve).on("error", reject).screenshots({
        timestamps: [timestamp],
        filename: require$$1.basename(tempPath),
        folder: require$$1.dirname(tempPath),
        size: `${width}x${height}`
      });
    });
    const image = await sharp(tempPath).webp({ quality }).toBuffer();
    await main.fs.unlink(tempPath);
    await main.fs.writeFile(cachePath, image);
    return `data:image/webp;base64,${image.toString("base64")}`;
  } catch (err) {
    console.error("Failed to generate video thumbnail:", err);
    return null;
  }
}
async function getThumbnail(filePath, options = {}) {
  const ext = require$$1.extname(filePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) {
    return getImageThumbnail(filePath, options);
  } else if (VIDEO_EXTENSIONS.has(ext)) {
    return getVideoThumbnail(filePath, options);
  }
  return null;
}
exports.getThumbnail = getThumbnail;
