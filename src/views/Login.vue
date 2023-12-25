<template>
  <div class='wrapper'>
    <div>欢迎使用</div>
    <nut-form
      :model-value='formData'
      ref='ruleForm'
    >
      <nut-form-item
        label='用户名'
        prop='name'
        required
        :rules="[{ required: true, message: '请填写用户名' }]"
      >
        <input
          class='nut-input-text'
          @blur="customBlurValidate('name')"
          v-model='formData.name'
          placeholder='请输入用户名'
          type='text'
        />
      </nut-form-item>
      <nut-form-item
        label='密码'
        prop='pwd'
        required
        :rules="[
      { required: true, message: '请填写密码' },
      // { validator: customValidator, message: '必须输入数字' },
      // { regex: /^(\d{1,2}|1\d{2}|200000000)$/, message: '必须输入0-200000000区间' }
    ]"
      >
        <input
          class='nut-input-text'
          v-model='formData.pwd'
          placeholder='请输入密码'
          type='text'
        />
      </nut-form-item>
      <nut-cell>
        <nut-button
          type='primary'
          size='small'
          style='margin-right: 10px'
          @click='submit'
        >登录</nut-button>
        <nut-button
          size='small'
          @click='reset'
        >重置</nut-button>
      </nut-cell>
    </nut-form>
  </div>
</template>

<script lang='ts'>
import { Notify, Toast } from '@nutui/nutui'
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const router = useRouter()
    const formData = reactive({
      name: '',
      pwd: ''
    })
    const validate = (item: any) => {
      console.log(item)
    }
    const ruleForm = ref<any>(null)

    const submit = () => {
      ruleForm.value.validate().then(({ valid, errors }: any) => {
        if (valid) {
          console.log('success', formData)
          if (formData.name == import.meta.env.VITE_USERNAME) {
            if (formData.pwd == import.meta.env.VITE_PASSWORD) {
              Notify.success('登录成功,欢迎回来！', { duration: 1000 })
              Toast.loading('', {
                cover: false // 透明罩
              })
              sessionStorage.setItem('token', import.meta.env.VITE_TOKEN) // 临时存储，关闭标签后就清除
              setTimeout(() => {
                router.push({ path: '/sub' })
                // router.replace('/sub')
                Toast.hide()
              }, 1200)
            } else {
              Notify.danger('密码错误!')
            }
          } else {
            Notify.warn('用户不存在!')
          }
        } else {
          console.log('error submit!!', errors)
        }
      })
    }
    const reset = () => {
      ruleForm.value.reset()
    }
    // 失去焦点校验
    const customBlurValidate = (prop: string) => {
      ruleForm.value.validate(prop).then(({ valid, errors }: any) => {
        if (valid) {
          console.log('success', formData)
        } else {
          console.log('error submit!!', errors)
        }
      })
    }
    // 函数校验
    const customValidator = (val: string) => /^\d+$/.test(val)
    // Promise 异步校验
    const asyncValidator = (val: string) => {
      return new Promise(resolve => {
        Toast.loading('模拟异步验证中...')
        setTimeout(() => {
          Toast.hide()
          resolve(
            /^400(-?)[0-9]{7}$|^1\d{10}$|^0[0-9]{2,3}-[0-9]{7,8}$/.test(val)
          )
        }, 1000)
      })
    }
    return {
      ruleForm,
      formData,
      validate,
      customValidator,
      asyncValidator,
      customBlurValidate,
      submit,
      reset
    }
  }
}
</script>

<style lang='scss' scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h3 {
    padding-bottom: 24px;
  }
}
</style>