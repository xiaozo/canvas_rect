<template>
<cube-form :model="model" @validate="validateHandler" @submit="submitHandler">
  <cube-form-group>
    <cube-form-item :field="fields[0]"></cube-form-item>
    <cube-form-item :field="fields[1]"></cube-form-item>
  </cube-form-group>
  <cube-form-group>
    <cube-button type="submit">Submit</cube-button>
  </cube-form-group>
</cube-form>
</template>

<script>
const PCA = {
  props: {
    value: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      selected: []
    }
  },
  render(createElement) {
    return createElement('cube-button', {
      on: {
        click: this.showPicker
      }
    }, this.selected.length ? this.selected.join(' ') : 'placeholder')
  },
  mounted() {
  },
  methods: {
      showPicker() {
     
    },
    selectHandler(selectedVal, selectedIndex, selectedTxt) {
    }
  }
}

export default {
     name:'Test',
      data() {
    return {
      validity: {},
      valid: undefined,
      model: {
        inputValue: '',
        pcaValue: [],
        dateValue: ''
      },
      fields: [
        {
          type: 'textarea',
          modelKey: 'inputValue',
          label: 'Input',
          props: {
            placeholder: '请输入'
          },
          rules: {
            required: true
          }
        },
        {
          component: PCA,
          modelKey: 'pcaValue',
          label: 'PCASelect',
          rules: {
            required: true
          },
          messages: {
            required: '请选择'
          }
        },
        {
          modelKey: 'dateValue',
          label: 'Date',
          rules: {
            required: true
          }
        }
      ]
    }
  },
  methods: {
    submitHandler(e) {
      console.log('submit')
    },
    validateHandler(result) {
      this.validity = result.validity
      this.valid = result.valid
      console.log('validity', result.validity, result.valid, result.dirty, result.firstInvalidFieldIndex)
    },
    dateSelectHandler(selectedVal) {
      this.model.dateValue = new Date(selectedVal[0], selectedVal[1] - 1, selectedVal[2]).toDateString()
    }
  },

}
</script>