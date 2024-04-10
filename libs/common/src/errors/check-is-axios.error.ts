import axios, { AxiosError } from 'axios';

export function checkIsAxiosError(error: Error | AxiosError) {
  if (axios.isAxiosError(error)) {
    console.log(error.response.data);
  } else {
    console.log(error.message);
  }
}
