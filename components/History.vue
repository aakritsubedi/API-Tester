<template>
  <div class="card histroy">
    <div class="card-body">
      <h3>History</h3>
      <ul class="list-unstyled">
        <li
          v-for="(history, key) in histories"
          :key="key"
          @click="setDataFromHistory(key)"
          style="cursor: pointer; margin-bottom: 10px"
        >
          <i class="delete-icon fa fa-trash" @click="deleteHistory(key)"></i>
          <small class="text-info d-block">{{ history.requestName }}</small>
          <span class="text-uppercase">{{ history.apiMethod }}</span>
          <small class="text-muted">{{ history.apiURL }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'History',
  props: ['histories', 'setDataFromHistory', 'deleteHistory']
}
</script>
