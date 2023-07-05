import axios from "axios";

export async function uploadToS3(token: string, s3Url:string, data:any) {
    const header: any = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
    
      return new Promise((resolve, reject) => {
        axios
            .post(s3Url, data, {
                headers: header,
            })
            .then((result: any) => {
                if (result.data.code === 200) {
                    resolve(result?.data);
                } else {
                    reject(result.data);
                }
            })
            .catch((error:any) => {
                reject(error);
            });
    });
  }  