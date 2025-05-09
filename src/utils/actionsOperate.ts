import { shallowRef, nextTick } from 'vue';
import ActionRadio from '@/views/editor/components/ActionRadio.vue';
import FilterSelect from '@/views/editor/components/FilterSelect.vue';
import Regex from '@/views/editor/components/Regex.vue';
import HandleDuplicate from '@/views/editor/components/HandleDuplicate.vue';
import Script from '@/views/editor/components/Script.vue';

export const addItem = (
  form,
  actionsList,
  actionsChecked,
  selectedOptions,
  t
) => {
  const id = Math.random() * 100000000 + '';
  const type = selectedOptions[0].value;
  const args = selectedOptions[0].args;
  const enabled = true;
  const customName = selectedOptions[0].customName || "";
  const obj = {
    id,
    customName,
    type,
    tipsDes: t(`editorPage.subConfig.nodeActions['${type}'].tipsDes`),
    component: null,
    enabled,
  };

  actionsChecked.push([id, true]);
  switch (type) {
    case 'Flag Operator':
    case 'Sort Operator':
    case 'Resolve Domain Operator':
      obj.component = shallowRef(ActionRadio);
      form.process.push({ id, type, args: args ?? null, customName });
      break;
    case 'Region Filter':
    case 'Type Filter':
      obj.component = shallowRef(FilterSelect);
      form.process.push({ id, type, args: args ?? [], customName });
      break;
    case 'Regex Filter':
      obj.component = shallowRef(Regex);
      form.process.push({ id, type, args: args ?? { keep: true, regex: [] }, customName });
      break;
    case 'Regex Sort Operator':
    case 'Regex Delete Operator':
    case 'Regex Rename Operator':
      obj.component = shallowRef(Regex);
      form.process.push({ id, type, args: args ?? [] , customName});
      break;
    case 'Handle Duplicate Operator':
      obj.component = shallowRef(HandleDuplicate);
      form.process.push({
        id,
        type,
        args: args ?? {
          action: 'rename',
          link: '-',
          position: 'back',
          template: '0 1 2 3 4 5 6 7 8 9',
        },
        customName
      });
      break;
    case 'Script Filter':
    case 'Script Operator':
      obj.component = shallowRef(Script);
      form.process.push({
        id,
        type,
        args: args ?? {
          content: '',
          mode: 'link',
        },
        customName
      });
      break;
  }
  actionsList.push(obj);

  // 添加后将页面置底
  // nextTick(() => {
  //   const container = document.querySelector('.app-layout-wrapper');
  //   container.scrollTo({
  //     top: container.scrollHeight,
  //     left: 0,
  //     behavior: 'smooth',
  //   });
  // });
  nextTick(() => {
    const container = document.querySelector('.app-layout-wrapper');
    const distanceToScrollUp = 90; // 向上调整

    const currentScrollTop = container.scrollTop;

    const targetScrollTop = currentScrollTop + distanceToScrollUp;
  
    container.scrollTo({
      top: targetScrollTop,
      left: 0,
      behavior: 'smooth',
    });
  });
  
};


export const deleteItem = (form, actionsList, actionsChecked, id) => {
  const processIndex = form.process.findIndex(item => item.id === id);
  const actionsIndex = actionsList.findIndex(item => item.id === id);
  const checkedIndex = actionsChecked.findIndex(item => item[0] === id);
  form.process.splice(processIndex, 1);
  actionsList.splice(actionsIndex, 1);
  actionsChecked.splice(checkedIndex, 1);
};

export const toggleItem = (actionsList, id) => {
  const index = actionsList.findIndex((item) => item.id === id);
  actionsList[index].enabled = !actionsList[index].enabled;
};
