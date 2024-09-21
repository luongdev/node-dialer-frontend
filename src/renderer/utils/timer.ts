class Timer {

  timeout(interval: number, args?: any): Promise<Timer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(args);
      }, interval);
    });
  }


  inTheEnd(): Promise<Timer> {
    return this.timeout(0);
  }


  interval(interval: number, callback: Function) {
    this.timeout(interval).then(() => {
      typeof callback === "function" &&
        callback() !== false &&
        this.interval(interval, callback);
    });
    return { then: (c) => (callback = c) };
  }

  private _runInterval(callback: Function) {
    if (typeof callback === "function") {
      return callback()
    }
    return false;
  }

  start() {
    const startDate = new Date();
    return {
      stop() {
        const stopDate = new Date();
        return stopDate.getTime() - startDate.getTime();
      },
    };
  }
}

export default new Timer();
