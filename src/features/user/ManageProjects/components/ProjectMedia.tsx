import React, { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/StepForm.module.scss';
import MaterialTextField from '../../../common/InputTypes/MaterialTextField';
import AnimatedButton from '../../../common/InputTypes/AnimatedButton';
import i18next from '../../../../../i18n';
import BackArrow from '../../../../../public/assets/images/icons/headerIcons/BackArrow';
import { deleteAuthenticatedRequest, getAuthenticatedRequest, postAuthenticatedRequest, putAuthenticatedRequest } from '../../../../utils/apiRequests/api';
import { getS3Image } from '../../../../utils/getImageURL';
import DeleteIcon from '../../../../../public/assets/images/icons/manageProjects/Delete';
import Star from '../../../../../public/assets/images/icons/manageProjects/Star';

const { useTranslation } = i18next;

interface Props {
  handleNext: Function;
  handleBack: Function;
  projectDetails: Object;
  setProjectDetails: Function;
  projectGUID: String;
  handleReset: Function;
  session: any;
}

export default function ProjectMedia({ handleBack, session, handleNext, projectDetails, setProjectDetails, projectGUID, handleReset }: Props): ReactElement {
  const { t, i18n } = useTranslation(['manageProjects']);

  const { register, handleSubmit, errors } = useForm({ mode: 'all' });

  const [uploadedImages, setUploadedImages] = React.useState([])

  const [isUploadingData,setIsUploadingData] = React.useState(false)

  React.useEffect(() => {
    // Fetch images of the project 
    if (projectGUID !== '' && projectGUID !== null && session?.accessToken)
      getAuthenticatedRequest(`/app/profile/projects/${projectGUID}?_scope=images`, session).then((result) => {        
        setUploadedImages(result.images)
      })
  }, [projectGUID]);


  const uploadPhotos = (image: any) => {
    setIsUploadingData(true)

    const submitData = {
      "imageFile": image,
      "description": null,
      "isDefault": false
    }
    postAuthenticatedRequest(`/app/projects/${projectGUID}/images`, submitData, session).then((res) => {
      let newUploadedImages = uploadedImages;
      newUploadedImages.push(res)
      setUploadedImages(newUploadedImages)
      setIsUploadingData(false)

    })
  };

  React.useEffect(() => {
    if (!projectGUID || projectGUID === '') {
      handleReset('Please fill the Basic Details first')
    }
  })

  const [files, setFiles] = React.useState([]);

  const onDrop = React.useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader()
      reader.readAsDataURL(file);
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = (event) => {
        uploadPhotos(event.target.result);
      }
    })

  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/*',
    multiple: true,
    onDrop: onDrop,
    onDropAccepted: () => {
      console.log('uploaded');

    },

    // onFileDialogCancel: () => {
    //     alert('no file selected')
    // }
  });

  const [youtubeURL, setYoutubeURL] = React.useState(projectDetails.videoURL ?projectDetails.videoURL:'' )
  
  React.useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  const deleteProjectCertificate = (id: any) => {
    deleteAuthenticatedRequest(`/app/projects/${projectGUID}/images/${id}`, session).then(res => {
      if (res !== 404) {
        let uploadedFilesTemp = uploadedImages.filter(item => item.id !== id);
        setUploadedImages(uploadedFilesTemp)
      }
    })
  }

  const onSubmit = (data: any) => {
    // Add isDirty test here
    setIsUploadingData(true)

    const submitData = {
      videoUrl:data.youtubeURL
    }

    putAuthenticatedRequest(`/app/projects/${projectGUID}`, submitData, session).then((res) => {
      setProjectDetails(res)
      setIsUploadingData(false)
      handleNext()
    })
  };
  return (
    <div className={styles.stepContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
      <div className={`${isUploadingData ? styles.shallowOpacity : ''}`}>
        <div className={styles.formFieldLarge}>
          {youtubeURL && !errors.youtubeURL ? (
            <iframe src="https://www.youtube.com/embed/tgbNymZ7vqY"></iframe>
          ) : null}
        </div>
        <div className={styles.formFieldLarge}>
          <MaterialTextField
            inputRef={register({
              pattern: {
                value: /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/,
                message: "Invalid Youtube Video Link"
              }
            })}
            label={t('manageProjects:youtubeURL')}
            variant="outlined"
            name="youtubeURL"
            onChange={() => setYoutubeURL}
            defaultValue={youtubeURL}
          />

        </div>
        {errors.youtubeURL && (
          <span className={styles.formErrors}>
            {errors.youtubeURL.message}
          </span>
        )}

        {/* Change to field array of react hook form  */}
        {uploadedImages && uploadedImages.length > 0 ?
          <div className={styles.formField}>
            {
              uploadedImages.map((image) => {
                return (
                  <div key={image.id} className={styles.formFieldHalf}>
                    <div className={styles.uploadedImageContainer}>
                      <img src={getS3Image('project', 'medium', image.image)} />
                      <div className={styles.uploadedImageOverlay}></div>
                      <input type="text" name="" placeholder="Add Caption" />
                      <div className={styles.uploadedImageButtonContainer}>
                        <div onClick={() => deleteProjectCertificate(image.id)}>
                          <DeleteIcon />
                        </div>
                        <div>
                          <Star />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          : null}

        <div className={styles.formFieldLarge} {...getRootProps()}>
          <label htmlFor="upload" className={styles.fileUploadContainer}>
            <AnimatedButton
              onClick={uploadPhotos}
              className={styles.continueButton}
            >
              <input {...getInputProps()} />
                            Upload Photos

                        </AnimatedButton>
            <p style={{ marginTop: '18px' }}>
              or drag them in
                        </p>
          </label>

          {/* <input type="file" multiple id="upload" style={{ display: 'none' }} /> */}
        </div>
        </div>

        <div className={styles.formField}>
          <div className={`${styles.formFieldHalf}`}>
            <AnimatedButton
              onClick={handleBack}
              className={styles.secondaryButton}
            >
              <BackArrow />
              <p>Back to basic details</p>
            </AnimatedButton>
          </div>
          <div style={{ width: '20px' }} />
          <div className={`${styles.formFieldHalf}`}>
          <div onClick={handleSubmit(onSubmit)} className={styles.continueButton}>
              {isUploadingData? <div className={styles.spinner}></div> : "Save & Continue"}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
