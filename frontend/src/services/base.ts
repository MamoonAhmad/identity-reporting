import axios from "axios";
import { TestValidatorConfigJSON } from "../validators/test";

const baseURL = "http://localhost:8005/";

export class BaseService<T extends { id: string }> {
  endpoint!: string;

  async get(_filters: { [key: string]: any }): Promise<T[]> {
    try {
      const res = await axios.get<T[]>(
        `${baseURL}${this.endpoint}`,
        _filters || null
      );
      return res.data;
    } catch (e) {
      return [];
    }
  }

  async retrieve(pk: string): Promise<T | null> {
    try {
      const res = await axios.get<T>(`${baseURL}${this.endpoint}/${pk}`);
      return res.data;
    } catch (e) {
      return null;
    }
  }

  async post(data: Omit<T, "id">): Promise<T | null> {
    try {
      const res = await axios.post<T>(`${baseURL}${this.endpoint}`, data);
      return res.data;
    } catch (e) {
      return null;
    }
  }

  async put(data: T): Promise<T | null> {
    try {
      const res = await axios.put<T>(
        `${baseURL}${this.endpoint}/${data.id}`,
        data
      );
      return res.data;
    } catch (e) {
      return null;
    }
  }
  async delete(pk: string): Promise<T | null> {
    try {
      const res = await axios.delete<T>(
        `${baseURL}${this.endpoint}/${pk}`
      );
      return res.data;
    } catch (e) {
      return null;
    }
  }
}

export class TestCaseService extends BaseService<TestValidatorConfigJSON> {
  endpoint = "test_case";
}
