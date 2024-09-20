
import { memoryInfo } from "customTypes/global";
import Timer from "./timer";

class Performance {

  startExecute(name = ""): Function {
    const timer = Timer.start();
    const usedJSHeapSize = this.getMemoryInfo().usedJSHeapSize;
    return (name2 = "") => {
      const executeTime = timer.stop();
      const endMemoryInfo = this.getMemoryInfo();
      console.log(
        "%cPerformance%c \n1. Path：%c%s%c\n2. Exec time： %c%sms%c \n3. Mem：%sB \n4. Alloc Mem： %sMB \n5. Usage Mem：%sMB \n6. Free Mem： %sMB",
        "padding: 2px 4px 2px 4px; background-color: #4caf50; color: #fff; border-radius: 4px;",
        "",
        "color: #ff6f00",
        `${name} ${name2}`,
        "",
        "color: #ff6f00",
        executeTime,
        "",
        endMemoryInfo.usedJSHeapSize - usedJSHeapSize,
        this.toMBSize(endMemoryInfo.jsHeapSizeLimit),
        this.toMBSize(endMemoryInfo.usedJSHeapSize),
        this.toMBSize(endMemoryInfo.totalJSHeapSize)
      );
    };
  }


  getMemoryInfo(): memoryInfo {
    let memoryinfo = <memoryInfo>{};
    if (window.performance && window.performance.memory) {
      memoryinfo = window.performance.memory;
    }
    return memoryinfo;
  }

  toMBSize(byteSize: number): string {
    return (byteSize / (1024 * 1024)).toFixed(1);
  }
}

export default new Performance();
