<template>
  <!-- 滚动内容 -->
  <nut-swipe class="sub-item-swipe" ref="swipe" :disabled="props.disabled">
    <div
      class="sub-item-wrapper"
      :style="{ padding: isSimpleMode ? '9px' : '16px' }"
      @click="onClickPreview"
    >
      <!-- compareSub -->
      <div
        @click.stop="compareSub"
        class="sub-img-wrappers"
        :style="{ 'margin-top': isSimpleMode ? '5px' : '0' }"
      >
        <div v-if="isIconColor">
          <nut-avatar
            v-if="props[props.type].icon"
            :size="isSimpleMode ? '36' : '48'"
            :url="props[props.type].icon"
            bg-color=""
          />
          <nut-avatar
            v-else
            class="sub-item-customer-icon"
            :size="isSimpleMode ? '36' : '48'"
            :url="icon"
            bg-color=""
          />
        </div>
        <div v-else>
          <nut-avatar
            class="sub-item-customer-icon"
            :size="isSimpleMode ? '36' : '48'"
            :url="props[props.type].icon || icon"
            bg-color=""
          />
        </div>
      </div>
      <div class="sub-item-content">
        <div class="sub-item-title-wrapper">
          <h3 v-if="!isSimpleMode" class="sub-item-title">
            {{ displayName || name }}
          </h3>
          <h3 v-else style="color: var(--primary-text-color); font-size: 16px">
            {{ displayName || name }}
          </h3>

          <!-- onClickCopyLink 拷贝 -->
          <div
            style="position: relative"
            :style="{ top: isSimpleMode ? '8px' : '0' }"
          >
            <button class="copy-sub-link" @click.stop="onClickCopyLink">
              <font-awesome-icon icon="fa-solid fa-clone" />
            </button>
            <button
              class="refresh-sub-flow"
              @click.stop="onClickRefresh"
              v-if="props.type === 'sub' && (!isSimpleMode || isSimpleReicon)"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-rotate-right" />
            </button>

            <!-- 编辑 -->
            <button
              v-if="!isSimpleMode"
              class="copy-sub-link"
              @click.stop="onClickEdit"
            >
              <font-awesome-icon icon="fa-solid fa-pen-nib" />
            </button>
            <button class="refresh-sub-flow" @click.stop="onClickEdit" v-else>
              <font-awesome-icon icon="fa-solid fa-pen-nib" />
            </button>

            <button
              class="copy-sub-link"
              @click.stop="swipeController"
              v-if="!isMobile()"
              ref="moreAction"
            >
              <font-awesome-icon icon="fa-solid fa-angles-right" />
            </button>
          </div>
        </div>
        <template v-if="!isSimpleMode">
          <p v-if="type === 'sub'" class="sub-item-detail">
            <template v-if="typeof flow === 'string'">
              <span>
                {{ flow }}
              </span>
            </template>
            <template v-else>
              <span>
                {{ flow.firstLine }}
              </span>
              <span> {{ flow.secondLine }} </span>
            </template>
          </p>
          <p v-else-if="type === 'collection'" class="sub-item-detail">
            {{ collectionDetail }}
          </p>
        </template>

        <template v-else>
          <p v-if="type === 'sub'" class="sub-item-detail-isSimple">
            <template v-if="typeof flow === 'string'">
              <span style="font-weight: normal">
                {{ flow }}
              </span>
            </template>
            <template v-else>
              <span style="font-weight: normal">
                {{ flow.firstLine }} &nbsp;
              </span>
              <span style="font-weight: normal"> {{ flow.secondLine }} </span>
            </template>
          </p>
          <p v-else-if="type === 'collection'" class="sub-item-detail-isSimple">
            {{ collectionDetail }}
          </p>
        </template>
      </div>
    </div>
    <!-- 加入判断 开启拖动不显示 -->
    <template v-if="isLeftRight" #left>
      <!-- Copy -->
      <div class="sub-item-swipe-btn-wrapper">
        <nut-button
          shape="square"
          type="primary"
          class="sub-item-swipe-btn"
          @click="onClickCopyConfig"
        >
          <font-awesome-icon icon="fa-solid fa-paste" />
        </nut-button>
      </div>
      <!-- preview -->
      <!-- <div class="sub-item-swipe-btn-wrapper">
        <nut-button shape="square" type="success" class="sub-item-swipe-btn" @click="onClickPreview">
          <font-awesome-icon icon="fa-solid fa-eye" />
        </nut-button>
      </div> -->
      <!-- del -->
      <div class="sub-item-swipe-btn-wrapper">
        <nut-button
          shape="square"
          type="danger"
          class="sub-item-swipe-btn"
          @click="onClickDelete"
        >
          <font-awesome-icon icon="fa-solid fa-trash-can" />
        </nut-button>
      </div>
    </template>

    <template v-else #right>
      <div class="sub-item-swipe-btn-wrapper">
        <nut-button
          shape="square"
          type="primary"
          class="sub-item-swipe-btn"
          @click="onClickCopyConfig"
        >
          <font-awesome-icon icon="fa-solid fa-paste" />
        </nut-button>
      </div>
      <!-- <div class="sub-item-swipe-btn-wrapper">
        <nut-button shape="square" type="success" class="sub-item-swipe-btn" @click="onClickPreview">
          <font-awesome-icon icon="fa-solid fa-eye" />
        </nut-button>
      </div> -->
      <div class="sub-item-swipe-btn-wrapper">
        <nut-button
          shape="square"
          type="danger"
          class="sub-item-swipe-btn"
          @click="onClickDelete"
        >
          <font-awesome-icon icon="fa-solid fa-trash-can" />
        </nut-button>
      </div>
    </template>
  </nut-swipe>

  <CompareTable
    v-if="compareTableIsVisible"
    :name="name"
    :compareData="compareData"
    @closeCompare="closeCompare"
  />
</template>

<script lang="ts" setup>
  import { useSubsApi } from '@/api/subs';
  import icon from '@/assets/icons/logo.svg';
  import PreviewPanel from '@/components/PreviewPanel.vue';
  import { usePopupRoute } from '@/hooks/usePopupRoute';
  import { useAppNotifyStore } from '@/store/appNotify';
  import { useGlobalStore } from '@/store/global';
  import { useSubsStore } from '@/store/subs';
  import { getString } from '@/utils/flowTransfer';
  import { isMobile } from '@/utils/isMobile';
  import CompareTable from '@/views/CompareTable.vue';
  import { Dialog, Toast } from '@nutui/nutui';
  import { useClipboard } from '@vueuse/core';
  import dayjs from 'dayjs';
  import { storeToRefs } from 'pinia';
  import { computed, createVNode, ref, toRaw } from 'vue';
  import useV3Clipboard from 'vue-clipboard3';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { useHostAPI } from '@/hooks/useHostAPI';

  const { copy, isSupported } = useClipboard();
  const { toClipboard: copyFallback } = useV3Clipboard();

  const { t } = useI18n();

  const props = defineProps<{
    type: 'sub' | 'collection';
    sub?: Sub;
    collection?: Collection;
    disabled?: boolean;
  }>();
  // console.log('props.disabled')
  // console.log(props.disabled)
  const compareTableIsVisible = ref(false);
  usePopupRoute(compareTableIsVisible);

  const moreAction = ref();
  const swipe = ref();
  const swipeIsOpen = ref(false);
  const compareData = ref();
  const router = useRouter();
  const globalStore = useGlobalStore();
  const subsStore = useSubsStore();
  const subsApi = useSubsApi();
  const {
    isFlowFetching,
    isSimpleMode,
    isLeftRight,
    isIconColor,
    isSimpleReicon,
  } = storeToRefs(globalStore);

  const displayName =
    props[props.type].displayName || props[props.type]['display-name'];

  const name = props[props.type].name;
  const { flows } = storeToRefs(subsStore);
  const collectionDetail = computed(() => {
    const nameList = props?.collection.subscriptions || [];
    if (nameList.length === 0) {
      return t('subPage.collectionItem.noSub');
    } else {
      const displayNameList = nameList.map(name => {
        const sub = subsStore.getOneSub(name);
        return sub?.displayName || sub?.['display-name'] || sub.name;
      });
      return `${t('subPage.collectionItem.contain')}：${displayNameList.join(
        '、'
      )}`;
    }
  });

  const flow = computed(() => {
    if (props.type === 'sub') {
      const urlList = Object.keys(flows.value);
      if (props.sub.source === 'local') return t('subPage.subItem.local');
      if (isFlowFetching.value && !urlList.includes(props.sub.url))
        return t('subPage.subItem.loading');

      const target = toRaw(flows.value[props.sub.url]);
      if (!target) {
        return {
          firstLine: t('subPage.subItem.noRecord'),
          secondLine: ``,
        };
      }

      if (target.status === 'success') {
        const {
          expires,
          total,
          usage: { upload, download },
        } = target.data;

        let secondLine: string;
        if (isSimpleMode.value) {
          secondLine = !expires
            ? ''
            : `${dayjs.unix(expires).format('YYYY-MM-DD')}`;
          return {
            firstLine: `${getString(upload + download, total, 'B')}`,
            secondLine,
          };
        } else {
          secondLine = !expires
            ? t('subPage.subItem.noExpiresInfo')
            : `${t('subPage.subItem.expires')}：${dayjs
                .unix(expires)
                .format('YYYY-MM-DD')}`;
          return {
            firstLine: `${t('subPage.subItem.flow')}：${getString(
              upload + download,
              total,
              'B'
            )}`,
            secondLine,
          };
        }
      } else if (target?.status === 'failed') {
        if (target.error.code === 'NO_FLOW_INFO') {
          return {
            firstLine: t('subPage.subItem.noFlowInfo'),
            secondLine: ``,
          };
        } else {
          return {
            firstLine: `${target.error?.type}`,
            secondLine: `${target.error?.message}`,
          };
        }
      }
    }
  });

  const closeCompare = () => {
    compareTableIsVisible.value = false;
    router.back();
  };

  const compareSub = async () => {
    Toast.loading('生成节点对比中...', { id: 'compare', cover: true, duration: 1500 });
    const res = await useSubsApi().compareSub(
      props.type,
      props.sub ?? props.collection
    );
    if (res?.data?.status === 'success') {
      compareData.value = res.data.data;
      compareTableIsVisible.value = true;
      Toast.hide('compare');
    }
  };
  const swipeClose = () => {
    swipe.value.close();
  };
  const swipeController = () => {
    if (swipeIsOpen.value) {
      swipe.value.close();
      swipeIsOpen.value = false;
      moreAction.value.style.transform = 'rotate(0deg)';
    } else {
      if (isLeftRight.value) {
        swipe.value.open('right');
      } else {
        swipe.value.open('left');
        swipeIsOpen.value = true;
        moreAction.value.style.transform = 'rotate(180deg)';
      }
    }
  };

  const onDeleteConfirm = async () => {
    await subsStore.deleteSub(props.type, name);
    // Notify.danger(t('subPage.deleteSub.succeedNotify'), { duration: 1500 });
  };

  const onClickPreview = () => {
    Dialog({
      title: t('subPage.previewTitle'),
      content: createVNode(PreviewPanel, {
        name,
        type: props.type,
        general: t('subPage.panel.general'),
        notify: t('subPage.copyNotify.succeed'),
      }),
      onOpened: () => swipe.value.close(),
      popClass: 'auto-dialog',
      // @ts-ignore-next-line  组件库bug，类型错误但功能正常
      closeOnClickOverlay: true,
      noOkBtn: true,
      noCancelBtn: true,
      closeOnPopstate: true,
      lockScroll: true,
    });
  };

  const onClickCopyConfig = async () => {
    let data: Sub | Collection;
    switch (props.type) {
      case 'sub':
        data = JSON.parse(JSON.stringify(toRaw(props.sub)));
        break;
      case 'collection':
        data = JSON.parse(JSON.stringify(toRaw(props.collection)));
        break;
    }
    data.name += `-copy${~~(Math.random() * 10000)}`;

    Toast.loading(t('subPage.copyConfigNotify.loading'), { id: 'copyConfig' });
    await subsApi.createSub(props.type + 's', data);
    await subsStore.fetchSubsData();
    Toast.hide('copyConfig');
    showNotify({ title: t('subPage.copyConfigNotify.succeed') });
    swipe.value.close();
  };

  const onClickEdit = () => {
    router.push(`/edit/${props.type}s/${encodeURIComponent(name)}`);
  };

  const onClickDelete = () => {
    Dialog({
      title: t('subPage.deleteSub.title'),
      content: createVNode(
        'span',
        {},
        t('subPage.deleteSub.desc', { displayName })
      ),
      onCancel: () => {},
      onOk: onDeleteConfirm,
      onOpened: () => swipe.value.close(),
      popClass: 'auto-dialog',
      cancelText: t('subPage.deleteSub.btn.cancel'),
      okText: t('subPage.deleteSub.btn.confirm'),
      closeOnPopstate: true,
      lockScroll: true,
    });
  };

  const { showNotify } = useAppNotifyStore();
  const { currentUrl: host } = useHostAPI();

  const onClickCopyLink = async () => {
    const url = `${host.value}/download/${
      props.type === 'collection' ? 'collection/' : ''
    }${encodeURIComponent(name)}`;

    if (isSupported) {
      await copy(url);
    } else {
      await copyFallback(url);
    }
    showNotify({ title: t('subPage.copyNotify.succeed') });
  };

  const onClickRefresh = async () => {
    Toast.loading(t('globalNotify.refresh.loading'), {
      cover: true,
      id: 'refresh',
    });
    await subsStore.fetchFlows(ref([props.sub]).value);
    Toast.hide('refresh');
    showNotify({ title: t('globalNotify.refresh.succeed') });
  };
</script>

<style lang="scss" scoped>
  .sub-item-customer-icon {
    :deep(img) {
      & {
        opacity: 0.8;
        filter: brightness(var(--img-brightness));
      }
    }
  }

  .sub-item-wrapper {
    line-height: 1.4;
    margin-left: auto;
    margin-right: auto;
    border-radius: var(--item-card-radios);
    display: flex;
    background: var(--card-color);

    :deep(.nut-avatar) {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      margin-right: 20px;
      border-radius: 12px;

      img {
        object-fit: contain;
        border-radius: 10px;
      }
    }

    > .sub-item-content {
      flex: 1;
      line-height: 1.6;

      .sub-item-title-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .sub-item-title {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          word-wrap: break-word;
          word-break: break-all;
          overflow: hidden;
          font-size: 16px;
          color: var(--primary-text-color);
        }

        .copy-sub-link,
        .refresh-sub-flow {
          background-color: transparent;
          border: none;
          padding: 0 8px;
          cursor: pointer;
          display: inline-flex;
          justify-content: center;
          align-items: center;

          svg {
            width: 16px;
            height: 16px;
            color: var(--lowest-text-color);
          }
        }

        button {
          white-space: nowrap;
        }

        div {
          display: flex;
          align-items: center;
        }
      }

      .sub-item-detail {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        margin-top: 4px;
        font-size: 12px;
        color: var(--comment-text-color);

        span {
          display: block;
          line-height: 1.8;
        }
      }

      .sub-item-detail-isSimple {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        font-size: 12px;
        // margin-top: 3.5px;
        max-width: 80%;
        color: var(--comment-text-color);
      }
    }
  }

  .sub-item-swipe {
    :deep(.nut-swipe__left) {
      .sub-item-swipe-btn-wrapper {
        padding-left: 24px;
      }
    }

    :deep(.nut-swipe__right),
    :deep(.nut-swipe__left) {
      display: flex;
      justify-content: space-around;
      align-items: center;

      .sub-item-swipe-btn-wrapper {
        padding-left: 14px;

        &:last-child {
          padding-right: 14px;
        }

        .sub-item-swipe-btn {
          border-radius: 50%;
          height: 46px;
          width: 44px;
        }
      }
    }
  }

  .desc-about {
    display: block;
    padding: 100px 30px 350px;
    color: var(--comment-text-color);
    font-size: 12px;
    line-height: 20px;
    margin-top: 8px;
    margin-bottom: 20px;
    text-align: left;
  }

  .desc-about span {
    display: inline-block;
    padding: 6px 0 0 0;
  }

  .desc-title a,
  .desc-about a {
    color: var(--primary-color);
  }

  .subs-list-wrapper {
    margin-bottom: 36px;
    position: relative;
  }

  .sub-img-wrappers {
    display: flex;
    align-items: center;
  }
</style>
