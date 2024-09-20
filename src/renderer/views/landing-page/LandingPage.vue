<template>
  <div id="wrapper">
    <img id="logo" :src="logo" alt="electron-vue" />
    <main>
      <div class="left-side">
        <span class="title">
          {{ i18nt.welcome }}
        </span>
      </div>

      <!--  -->
      <div class="right-side">
        <div class="doc">
          <div class="title alt">
            {{ i18nt.buttonTips }}
          </div>
          <button class="btu" @click="open()">
            {{ i18nt.buttons.console }}
          </button>
          <button class="btu" @click="CheckUpdate('one')">
            {{ i18nt.buttons.checkUpdate }}
          </button>
        </div>
        <div class="doc">
          <button class="btu" @click="CheckUpdate('two')">
            {{ i18nt.buttons.checkUpdate2 }}
          </button>
          <button class="btu" @click="CheckUpdate('three')">
            {{ i18nt.buttons.checkUpdateInc }}
          </button>
          <!-- <button class="btu" @click="CheckUpdate('four')">
            {{ i18nt.buttons.ForcedUpdate }}
          </button> -->
          <button class="btu" @click="StartServer">
            {{ i18nt.buttons.startServer }}
          </button>
          <button class="btu" @click="StopServer">
            {{ i18nt.buttons.stopServer }}
          </button>
          <button class="btu" @click="getMessage">
            {{ i18nt.buttons.viewMessage }}
          </button>
          <button class="btu" @click="startCrash">
            {{ i18nt.buttons.simulatedCrash }}
          </button>
        </div>
        <div class="doc">
          <button class="btu" @click="openNewWin">
            {{ i18nt.buttons.openNewWindow }}
          </button>
          <button class="btu" @click="changeLanguage">
            {{ i18nt.buttons.changeLanguage }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import SystemInformation from "./components/system-info-mation.vue";
import { message } from "@renderer/api/login";
import logo from "@renderer/assets/logo.png";
import { onUnmounted, ref } from "vue";
import { i18nt, setLanguage, globalLang } from "@renderer/i18n";
import { useStoreTemplate } from "@store/template";

const { ipcRendererChannel, shell, crash } = window;

// if (!ipcRenderer) {
//   ipcRenderer = {} as any;
//   ipcRenderer.on =
//     ipcRenderer.invoke =
//     ipcRenderer.removeAllListeners =
//     (...args: any): any => {
//       console.log("not electron");
//     };
// }

const percentage = ref(0);
const colors = ref([
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#6f7ad3", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#5cb87a", percentage: 100 },
] as string | ColorInfo[]);
const dialogVisible = ref(false);
const progressStaus = ref(null);
const filePath = ref("");
const updateStatus = ref("");
const showForcedUpdate = ref(false);

const storeTemplate = useStoreTemplate();

console.log(`storeTemplate`, storeTemplate.getTest);
console.log(`storeTemplate`, storeTemplate.getTest1);
console.log(`storeTemplate`, storeTemplate.$state.testData);

setTimeout(() => {
  storeTemplate.TEST_ACTION("654321");
  console.log(`storeTemplate`, storeTemplate.getTest1);
}, 1000);

const elPageSize = ref(100);
const elCPage = ref(1);

function changeLanguage() {
  setLanguage(globalLang.value === "zh-cn" ? "en" : "zh-cn");
}

function startCrash() {
  crash.start();
}

function openNewWin() {
  const data = {
    url: "/form/index",
  };
  ipcRendererChannel.OpenWin.invoke(data);
  // ipcRenderer.invoke("open-win", data);
}
function getMessage() {
  message().then((res) => {
    // ElMessageBox.alert(res.data, "hint", {
    //   confirmButtonText: "Sure",
    // });
  });
}
function StopServer() {
  ipcRendererChannel.StopServer.invoke().then((res) => {
    // ElMessage({
    //   type: "success",
    //   message: "Success",
    // });
  });
}
function StartServer() {
  ipcRendererChannel.StartServer.invoke().then((res) => {
    if (res) {
      // ElMessage({
      //   type: "success",
      //   message: res,
      // });
    }
  });
}
// 获取electron方法
function open() {}
function CheckUpdate(data) {
  switch (data) {
    case "one":
      ipcRendererChannel.CheckUpdate.invoke();
      console.log("启动检查");
      break;
    case "two":
      ipcRendererChannel.StartDownload.invoke("https://xxx").then(() => {
        dialogVisible.value = true;
      });
      break;
    case "three":
      ipcRendererChannel.HotUpdate.invoke();
      break;
    case "four":
      showForcedUpdate.value = true;
      break;

    default:
      break;
  }
}
function handleClose() {
  dialogVisible.value = false;
}

ipcRendererChannel.DownloadProgress.on((event, arg) => {
  percentage.value = Number(arg);
});
ipcRendererChannel.DownloadError.on((event, arg) => {
  if (arg) {
    progressStaus.value = "exception";
    percentage.value = 40;
    colors.value = "#d81e06";
  }
});
ipcRendererChannel.DownloadPaused.on((event, arg) => {
  if (arg) {
    progressStaus.value = "warning";
    // ElMessageBox.alert("Download error！", "Hint", {
    //   confirmButtonText: "Try again",
    //   callback: (action) => {
    //     ipcRenderer.invoke("start-download");
    //   },
    // });
  }
});
ipcRendererChannel.DownloadDone.on((event, age) => {
  filePath.value = age.filePath;
  progressStaus.value = "success";
  // ElMessageBox.alert("Update downloaded！", "Hint", {
  //   confirmButtonText: "Update",
  //   callback: (action) => {
  //     shell.shell.openPath(filePath.value);
  //   },
  // });
});
// electron-updater upload
ipcRendererChannel.UpdateMsg.on((event, age) => {
  switch (age.state) {
    case -1:
      const msgdata = {
        title: "发生错误",
        message: age.msg as string,
      };
      dialogVisible.value = false;
      ipcRendererChannel.OpenErrorbox.invoke(msgdata);
      break;
    case 0:
      console.log("check-update");
      break;
    case 1:
      dialogVisible.value = true;
      console.log("has update download-ing");
      break;
    case 2:
      console.log("not new version");
      break;
    case 3:
      percentage.value = Number(
        (age.msg as { percent: number }).percent.toFixed(1)
      );
      break;
    case 4:
      progressStaus.value = "success";
      ipcRendererChannel.ConfirmUpdate.invoke();
      break;
    default:
      break;
  }
});
ipcRendererChannel.UpdateProcessStatus.on((event, msg) => {
  switch (msg.status) {
    case "downloading":
      console.log("downloading");
      break;
    case "moving":
      console.log("moving");
      break;
    case "finished":
      console.log("finished");
      break;
    case "failed":
      console.log("msg.message.message");
      break;

    default:
      break;
  }
  console.log(msg);
  updateStatus.value = msg.status;
});
// onUnmounted(() => {
//   console.log("销毁了哦");
//   ipcRenderer.removeAllListeners("confirm-message");
//   ipcRenderer.removeAllListeners("download-done");
//   ipcRenderer.removeAllListeners("download-paused");
//   ipcRenderer.removeAllListeners("confirm-stop");
//   ipcRenderer.removeAllListeners("confirm-start");
//   ipcRenderer.removeAllListeners("confirm-download");
//   ipcRenderer.removeAllListeners("download-progress");
//   ipcRenderer.removeAllListeners("download-error");
// });
</script>

<style scoped lang="css">

</style>
