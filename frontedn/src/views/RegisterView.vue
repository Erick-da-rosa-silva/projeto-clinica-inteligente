<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="logo-icon">🏥</div>
        <h1>Criar Conta</h1>
        <p>Cadastre-se para acessar o sistema</p>
      </div>

      <form @submit.prevent="register">
        <div class="input-wrap">
          <label>Nome Completo</label>
          <input v-model="form.nome" type="text" placeholder="Ex: João da Silva" required />
        </div>
        <div class="input-wrap">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com" required />
        </div>
        <div class="input-wrap">
          <label>Senha</label>
          <input v-model="form.senha" type="password" placeholder="••••••••" required />
        </div>

        <div class="toast error" v-if="erro">{{ erro }}</div>
        <div class="toast success" v-if="sucesso">{{ sucesso }}</div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Cadastrando...' : 'Criar Conta' }}
        </button>
      </form>

      <p class="auth-link">
        Já tem conta?
        <RouterLink to="/login">Fazer login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const form = ref({ nome: '', email: '', senha: '' });
const erro = ref('');
const sucesso = ref('');
const loading = ref(false);

const register = async () => {
  loading.value = true;
  erro.value = '';
  sucesso.value = '';
  try {
    await axios.post('http://localhost:5000/auth/register', form.value);
    sucesso.value = '✅ Conta criada com sucesso!';
    setTimeout(() => router.push('/login'), 1500);
  } catch (err) {
    erro.value = err.response?.data?.error || 'Erro ao cadastrar';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: #111827;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  animation: fadeUp 0.6s ease both;
}

.auth-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 16px;
  box-shadow: 0 0 32px rgba(0,212,161,0.3);
}

.auth-logo h1 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 60%, #00d4a1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.auth-logo p { color: #6b7a99; font-size: 14px; }

.input-wrap { margin-bottom: 16px; }

.input-wrap label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b7a99;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 6px;
}

input {
  width: 100%;
  background: #0d1526;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 13px 16px;
  color: #e8edf5;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input::placeholder { color: #6b7a99; }
input:focus { border-color: #00d4a1; box-shadow: 0 0 0 3px rgba(0,212,161,0.1); }

.toast {
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  margin-bottom: 16px;
}

.toast.error { background: rgba(255,77,109,0.12); border: 1px solid rgba(255,77,109,0.3); color: #ff4d6d; }
.toast.success { background: rgba(0,212,161,0.12); border: 1px solid rgba(0,212,161,0.3); color: #00d4a1; }

.btn-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00d4a1, #0094ff);
  border: none;
  border-radius: 10px;
  color: #0a0f1e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  margin-top: 8px;
}

.btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.auth-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7a99;
}

.auth-link a { color: #00d4a1; text-decoration: none; font-weight: 500; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>