import axios from "axios";
import { TestConfig, TestConfigJSON } from "../components/TestRun/TestRunView";

const baseURL = 'http://localhost:8005/'

type BaseResponseType<T> = {
  data?: T;
  meta_data?: {
    page: number;
    current_page: number;
    total: number;
  };
  error?: string; // If the error is present, that means the request execution was not successful
  error_details_objects?: {
    [key: string]: any;
  };
};

export class BaseService<T extends {id: string}> {
  endpoint!: string;

  async get(_filters: { [key: string]: any }): Promise<T[]> {
    try {
        const res = await axios.get<T[]>(`${baseURL}${this.endpoint}`, _filters || null)
        return res.data
    }
    catch(e) {
        return []
    }
  }

  async retrieve(pk: string): Promise<T | null> {
    try {
        const res = await axios.get<T>(`${baseURL}${this.endpoint}/${pk}`)
        return res.data
    }
    catch(e) {
        return null
    }
  }

  async post(data: T): Promise<T | null> {
    try {
        const res = await axios.post<T>(`${baseURL}${this.endpoint}`, data)
        return res.data
    }
    catch(e) {
        return null
    }
    
  }

  async put(data: T): Promise<T | null> {
    try {
        const res = await axios.put<T>(`${baseURL}${this.endpoint}/${data.id}`, data)
        return res.data
    }
    catch(e) {
        return null
    }
    
  }
}


export class TestCaseService extends BaseService<TestConfigJSON>{
    endpoint = 'test_case'
}