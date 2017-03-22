if (!('console' in window)) {
    var nf = function(){};
    window.console = window.console || {
            assert: nf,
            clear: nf,
            count: nf,
            debug: nf,
            dir: nf,
            dirxml: nf,
            error: nf,
            exception: nf,
            group: nf,
            groupCollapsed: nf,
            groupEnd: nf,
            info: nf,
            log: nf,
            markTimeline: nf,
            profile: nf,
            profileEnd: nf,
            profiles: nf,
            table: nf,
            time: nf,
            timeEnd: nf,
            timeStamp: nf,
            timeline: nf,
            timelineEnd: nf,
            trace: nf,
            warn: nf,
        };
}