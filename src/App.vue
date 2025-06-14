<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import historyImg from "@/assets/history.png";
import opggImg from "@/assets/opgg_data.png";
import autoImg from "@/assets/auto.png";

const isDownloading = ref(false);
const downloadProgress = ref(0);
const downloadError = ref("");
const totalChunks = 9; // 总的分片数
const downloadComplete = ref(false); // 添加下载完成状态

const isVideoLoading = ref(false);
const videoProgress = ref(0);
const videoError = ref("");
const videoUrl = ref("");

const downloadButtonText = computed(() => {
  if (downloadError.value) return "重试下载";
  if (downloadComplete.value) return "下载完成";
  return isDownloading.value ? "下载中..." : "立即下载";
});

const startDownload = async () => {
  if (isDownloading.value || downloadComplete.value) return;

  isDownloading.value = true;
  downloadProgress.value = 0;
  downloadError.value = "";

  try {
    // 构建文件URL数组
    const fileUrls = Array.from(
      { length: totalChunks },
      (_, i) => `/chunks/RankHelper_Setup_v0.1.1.exe.part${i + 1}`
    );

    // 并行下载所有文件
    const fileContents = await Promise.all(
      fileUrls.map((url, index) =>
        axios
          .get(url, {
            responseType: "arraybuffer",
            onDownloadProgress: (progressEvent) => {
              const loaded = progressEvent.loaded;
              const total = progressEvent.total;
              const chunkProgress = (loaded / total) * (100 / totalChunks);
              downloadProgress.value = Math.min(
                99,
                Math.round(downloadProgress.value + chunkProgress)
              );
            },
          })
          .then((res) => {
            console.log(`成功下载分片 ${index + 1}`);
            return res.data;
          })
          .catch((error) => {
            console.error(`下载分片 ${index + 1} 失败:`, error);
            throw error;
          })
      )
    );

    console.log("所有分片下载完成，开始合并...");
    downloadProgress.value = 100;

    // 合并所有文件内容
    const totalLength = fileContents.reduce(
      (acc, curr) => acc + curr.byteLength,
      0
    );
    const mergedArray = new Uint8Array(totalLength);

    let offset = 0;
    for (const content of fileContents) {
      mergedArray.set(new Uint8Array(content), offset);
      offset += content.byteLength;
    }

    console.log("文件合并完成，准备下载...");

    // 创建下载链接
    const blob = new Blob([mergedArray], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "RankHelper_Setup_v0.1.1.exe";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("下载完成");
    downloadComplete.value = true; // 设置下载完成状态
  } catch (error) {
    console.error("下载失败:", error);
    downloadError.value = error.message;
  } finally {
    isDownloading.value = false;
  }
};

const loadVideo = async () => {
  if (isVideoLoading.value) return;

  isVideoLoading.value = true;
  videoProgress.value = 0;
  videoError.value = "";

  try {
    // 构建视频分片URL数组
    const fileUrls = Array.from(
      { length: totalChunks },
      (_, i) => `/chunks/rank_helper_vlog.mp4.part${i + 1}`
    );

    // 并行下载所有分片
    const fileContents = await Promise.all(
      fileUrls.map((url, index) =>
        axios
          .get(url, {
            responseType: "arraybuffer",
            onDownloadProgress: (progressEvent) => {
              const loaded = progressEvent.loaded;
              const total = progressEvent.total;
              const chunkProgress = (loaded / total) * (100 / totalChunks);
              videoProgress.value = Math.min(
                99,
                Math.round(videoProgress.value + chunkProgress)
              );
            },
          })
          .then((res) => {
            console.log(`成功下载视频分片 ${index + 1}`);
            return res.data;
          })
          .catch((error) => {
            console.error(`下载视频分片 ${index + 1} 失败:`, error);
            throw error;
          })
      )
    );

    console.log("所有视频分片下载完成，开始合并...");
    videoProgress.value = 100;

    // 合并所有分片
    const totalLength = fileContents.reduce(
      (acc, curr) => acc + curr.byteLength,
      0
    );
    const mergedArray = new Uint8Array(totalLength);

    let offset = 0;
    for (const content of fileContents) {
      mergedArray.set(new Uint8Array(content), offset);
      offset += content.byteLength;
    }

    // 创建视频URL
    const blob = new Blob([mergedArray], { type: "video/mp4" });
    videoUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error("视频加载失败:", error);
    videoError.value = error.message;
  } finally {
    isVideoLoading.value = false;
  }
};

// 页面加载时自动加载视频
loadVideo();
</script>

<template>
  <div class="app">
    <header>
      <div class="header-content">
        <img src="/favicon.ico" alt="Logo" class="logo" />
        <h1>RankHelper</h1>
        <nav class="nav-links">
          <!-- <a href="#" class="nav-link">首页</a> -->
        </nav>
      </div>
    </header>

    <main>
      <section class="hero-section">
        <div class="hero-content">
          <h2>让每个人都能轻松应对ELO</h2>
          <p class="hero-subtitle">
            借助 RankHelper 深入挖掘对局数据，助您轻松取胜！
          </p>
          <button
            class="download-btn primary-btn"
            @click="startDownload"
            :disabled="isDownloading || downloadComplete"
          >
            {{ downloadButtonText }}
          </button>
          <div v-if="isDownloading || downloadError" class="progress-container">
            <div
              class="progress-bar"
              :class="{ error: downloadError }"
              :style="{ width: downloadProgress + '%' }"
            ></div>
            <span class="progress-text">
              {{ downloadError || downloadProgress + "%" }}
            </span>
          </div>
        </div>
      </section>

      <!-- 视频展示部分 -->
      <section class="video-section">
        <div class="video-container">
          <div v-if="isVideoLoading || videoError" class="progress-container">
            <div
              class="progress-bar"
              :class="{ error: videoError }"
              :style="{ width: videoProgress + '%' }"
            ></div>
            <span class="progress-text">
              {{ videoError || videoProgress + "%" }}
            </span>
          </div>
          <video
            v-if="videoUrl"
            :src="videoUrl"
            class="demo-video"
            autoplay
            loop
            muted
            playsinline
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          ></video>
        </div>
      </section>

      <!-- 功能展示部分 -->
      <section class="features-showcase">
        <div class="feature-item">
          <div class="feature-image">
            <img :src="historyImg" alt="历史战绩" />
          </div>
          <div class="feature-text">
            <h3>历史战绩分析</h3>
            <p>深入分析召唤师历史对局数据，了解隐藏选手战绩，胸有成竹。</p>
          </div>
        </div>

        <div class="feature-item reverse">
          <div class="feature-image">
            <img :src="opggImg" alt="OPGG数据" />
          </div>
          <div class="feature-text">
            <h3>OPGG英雄推荐</h3>
            <p>实时获取OPGG英雄数据，包括符文、出装推荐，助您做出最佳选择。</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-image">
            <img :src="autoImg" alt="自动准备" />
          </div>
          <div class="feature-text">
            <h3>自动准备锁定</h3>
            <p>智能识别英雄选择界面，自动准备和锁定英雄，提升游戏体验。</p>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>
            RankHelper 致力于为用户提供出色的对局分析，以上功能均使用拳头公司LCU
            API,未侵入和破坏系统，请放心使用！
          </p>
        </div>
        <div class="footer-section">
          <h3>联系方式</h3>
          <p>如有问题，请通过以下方式联系我们</p>
          <a href="mailto:hamster_cloud@163.com">hamster_cloud@163.com</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --main-color: #fec64b;
  --error-color: #ff4d4f;
  --text-primary: #333;
  --text-secondary: #666;
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --border-color: #eaeaea;
  --content-width: 1800px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  width: 100%;
  position: relative;
  left: 0;
  right: 0;
}

header {
  background-color: var(--main-color);
  padding: 20px 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
}

.logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
}

header h1 {
  font-size: 1.5em;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 1em;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--main-color);
}

main {
  /* flex: 1; */
  margin-top: 80px;
}

.hero-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 100px 0;
  text-align: center;
  width: 100%;
}

.hero-content {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 40px;
}

.hero-content h2 {
  font-size: 4em;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient 8s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.hero-subtitle {
  font-size: 1.5em;
  color: var(--text-secondary);
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  text-align: center;
  font-size: 2.5em;
  margin-bottom: 60px;
  color: var(--text-primary);
}

.features-section {
  padding: 80px 0;
  background-color: var(--bg-secondary);
  width: 100%;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
}

.feature-card {
  background: var(--bg-primary);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5em;
  margin-bottom: 15px;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
}

.download-section {
  padding: 80px 0;
  text-align: center;
  background-color: var(--bg-primary);
  width: 100%;
}

.download-content {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
}

.download-content h2 {
  font-size: 2em;
  margin-bottom: 20px;
}

.download-btn {
  background-color: var(--main-color);
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  font-weight: 500;
}

.download-btn:hover:not(:disabled) {
  background-color: #f3b72d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(254, 198, 75, 0.4);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #ccc;
}

.download-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.progress-container {
  margin-top: 30px;
  background: #f0f0f0;
  border-radius: 8px;
  height: 20px;
  position: relative;
  overflow: hidden;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.progress-bar {
  background-color: var(--main-color);
  height: 100%;
  transition: width 0.3s ease;
}

.progress-bar.error {
  background-color: var(--error-color);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-primary);
  font-size: 0.9em;
  white-space: nowrap;
}

.demo-section {
  padding: 80px 0;
  background-color: var(--bg-secondary);
  width: 100%;
}

.demo-container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
}

.demo-placeholder {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  color: var(--text-secondary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

footer {
  background-color: var(--bg-primary);
  padding: 60px 0 20px;
  border-top: 1px solid var(--border-color);
  width: 100%;
}

.footer-content {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 1.2em;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.footer-section p {
  color: var(--text-secondary);
  margin-bottom: 15px;
}

.footer-section a {
  color: var(--main-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: #f3b72d;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .hero-content h2 {
    font-size: 2em;
  }

  .section-title {
    font-size: 2em;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

.video-section {
  padding: 60px 0;
  background-color: var(--bg-secondary);
  width: 100%;
}

.video-container {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 0 40px;
  text-align: center;
}

.demo-video {
  width: 100%;
  max-width: 1200px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.demo-video::-webkit-media-controls {
  display: none !important;
}

.demo-video::-webkit-media-controls-enclosure {
  display: none !important;
}

.demo-video::-webkit-media-controls-panel {
  display: none !important;
}

.features-showcase {
  padding: 80px 0;
  background-color: var(--bg-primary);
  width: 100%;
}

.feature-item {
  max-width: var(--content-width);
  margin: 0 auto 60px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 60px;
}

.feature-item.reverse {
  flex-direction: row-reverse;
}

.feature-image {
  flex: 1;
  max-width: 600px;
}

.feature-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-text {
  flex: 1;
}

.feature-text h3 {
  font-size: 2em;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.feature-text p {
  font-size: 1.2em;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .feature-item {
    flex-direction: column;
    gap: 30px;
  }

  .feature-item.reverse {
    flex-direction: column;
  }

  .feature-image {
    max-width: 100%;
  }
}
</style>
