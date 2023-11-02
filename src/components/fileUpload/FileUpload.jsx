import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaTrash, FaUpload } from 'react-icons/fa'
import Cropper from 'react-easy-crop'
import { getFormatedFileSize } from '../../utilities/helper'
import { getCroppedImg2, toFile } from '../../utilities/cropImage'
import Button from '../Button'

const FileUpload = ({
    data = {},
    onUpload = () => null,
    type = "image",
    cropSize = {},
    isMobile = false
}) => {

    const fileDetailsObj = {
        src: "",
        name: "",
        size: "",
    }
    const previousData = data?.details
    const tempUpdate = data?.tempUpdate
    const [fileDetails, setFileDetails] = useState(previousData ? previousData : fileDetailsObj)
    // forUpdate is just an indicator if image is provided by url not uploaded
    const { src = '', name = '', size = '', forUpdate = false, details = {} } = fileDetails ?? {}
    const { srcCropped = '' } = details ?? {}

    const [isCropStarted, setIsCropStarted] = useState(false)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)


    const { width = 0, height = 0 } = cropSize ?? {}


    const onDrop = useCallback(acceptedFiles => {
        const file = (acceptedFiles ? acceptedFiles[0] : "")
        // if (file && file.size <= 1039999) {
        if (file) {
            const reader = new FileReader();
            var url = reader.readAsDataURL(file);
            reader.onloadend = async function (e) {
                const details = {
                    src: reader.result,
                    name: file.name,
                    size: getFormatedFileSize(file.size),
                }
                setFileDetails(details)
                setCrop({ x: 0, y: 0 })
                setZoom(1)
                await onUpload({ file, details })
            }
        } else {
            setFileDetails(fileDetailsObj)
            onUpload({ file: null, details: {} })
        }

    }, [])

    let accept = {}
    switch (type) {
        case 'image':
            accept = { 'image/jpeg': ['.jpeg'] }
            break;
        case 'video':
            accept = { 'video/*': ['.mp4', '.webm'] }
            break;

        default:
            break;
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: false
    })

    const onRemove = () => {
        onUpload(null)
        setFileDetails(fileDetailsObj)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setIsCropStarted(false)
    }

    const onZoomChange = (e) => {
        setZoom(e)
        setIsCropStarted(true)
    }

    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {

        try {
            // const croppedImage = await getCroppedImg(src, { ...croppedAreaPixels, ...cropSize }, 0)
            const croppedImage = await getCroppedImg2(src, croppedAreaPixels, cropSize)
            // const croppedImage = await getCroppedImg(src, croppedAreaPixels, 0)
            const imgFileCropped = await toFile(croppedImage)
            // console.log(croppedImage)
            const details = {
                name: imgFileCropped?.name,
                size: getFormatedFileSize(imgFileCropped?.size ?? 0),
                srcCropped: croppedImage
            }

            if (isCropStarted) {
                setFileDetails(p => ({ ...p, details }))
                const newImageData = { file: imgFileCropped, details: { ...details, src } }
                await onUpload(newImageData)
            }

            // console.log(croppedImage)

        } catch (e) {
            console.log(e)
        }
    }, [src, isCropStarted])


    const cropContainerWidth = !forUpdate ? ((20 * width) / 100) + width : width + 5
    const cropContainerHeight = !forUpdate ? ((20 * height) / 100) + height : height + 5



    useEffect(() => {
        if (tempUpdate) {
            setFileDetails({ ...previousData, srcCropped: '', forUpdate: true, tempUpdate: false })
            setCrop({ x: 0, y: 0 })
            setZoom(1)
            setIsCropStarted(false)
        }
    }, [tempUpdate])

    const onGetData = () => console.log(fileDetails)

    return (
        <div className="file-upload-wrapper">
            {!src ?
                <div {...getRootProps()} className="file-upload">
                    <input {...getInputProps()} />
                    {src ?
                        <>
                            {type === 'image' && <img src={src} className="img-preview" />}
                            <p className="size">{size}</p>
                            <p className="name">{name}</p>

                        </>
                        :
                        <>
                            <FaUpload className="icon-upload" />
                            <p>Choose file to upload</p>
                            <p>Or</p>
                            <p>Drag and drop here.</p>
                        </>
                    }
                </div>
                :
                <div className="file-upload">
                    <div className="image-crop-modal-content">
                        <div className="image-crop-container" style={{ width: isMobile ? '100%' : cropContainerWidth, height: isMobile ? 'auto' : cropContainerHeight }}>
                            <Cropper
                                image={src}
                                crop={crop}
                                zoom={zoom}
                                cropSize={isMobile ? false : cropSize}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={onZoomChange}
                                onInteractionStart={() => setIsCropStarted(true)}
                                crossOrigin={null}
                            />
                        </div>
                        <div className="controls">
                            <label htmlFor="">Zoom:</label>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => onZoomChange(e.target.value)}
                                className="zoom-range"
                            />
                        </div>
                    </div>
                    {srcCropped &&
                        <img src={srcCropped} alt="" width={width} height={height}/>
                    }
                </div>
            }
            {src &&
                <div className="file-upload-buttons">
                    <Button variant="danger" className="icon-delete" onClick={onRemove}>
                        <FaTrash /> Delete
                    </Button>
                    {/* <Button onClick={onGetData}>
                        Get Data
                    </Button> */}
                </div>
            }
        </div>
    )
}

export default FileUpload