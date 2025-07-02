
export const convertPdfToWord = async (formData: FormData) => {
  // Simulate API call for PDF to Word conversion
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          url: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,mock-data',
          filename: 'converted.docx'
        }
      ]);
    }, 2000);
  });
};

export const convertPdfToJpg = async (formData: FormData) => {
  // Simulate API call for PDF to JPG conversion
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          url: 'data:image/jpeg;base64,mock-data',
          filename: 'converted.jpg'
        }
      ]);
    }, 2000);
  });
};

export const rotatePdf = async (data: [File, string]) => {
  const [file, angle] = data;
  // Simulate API call for PDF rotation
  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob([file], { type: 'application/pdf' });
      resolve(blob);
    }, 1500);
  });
};

export const rotatePDF = async (formData: FormData) => {
  // Simulate API call for PDF rotation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          filename: 'rotated.pdf'
        }
      ]);
    }, 1500);
  });
};
