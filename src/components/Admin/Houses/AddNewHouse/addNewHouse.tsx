"use client";
import React from 'react'
import { useRouter } from 'next/navigation';
import { Box } from '@mui/material'

import { useMainStore } from '@/stores/store-provider';
import FileUploadWithPreview from './components/FileUploadWithPreview'
import HouseFieldset from './components/HouseFieldset';
import SubmitFabGroup from '../../UI/SubmitFabGroup/SubmitFabGroup';
import HouseSelect from '../../UI/HouseSelect/HouseSelect';
import { initialAdminState } from '@/stores/adminSlice';
import { fieldsetData } from '@/data/admin/defaultsForHousesInputs';
import NumberFields from './components/NumberFields';

export default function AddNewHouse({ housesList }: { housesList: SingleHousesListType }) {
    const { refresh } = useRouter();

    const [loading, setLoading] = React.useState(false);

    const setDialogOpen = useMainStore((state) => state.setDialogOpen);
    const houseData = useMainStore((state) => state.houseAdding);
    const setHouseData = useMainStore((state) => state.setHouseAdding);

    const formRef = React.useRef<HTMLFormElement>(null);

    const handleResetForm = () => {
        formRef.current?.reset();
        setHouseData(initialAdminState.houseAdding);
        window?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);

        //чистим данные полученные из формы от файлов изображений, чтобы потом заменить файлами со стора
        for (let [key, value] of Array.from(formData)) {
            if (key.startsWith('photo')) formData.delete(key);
        }

        //вытягиваем файлы изображений со стейта компонента FileUploadWithPreview и добавляем их в FormData
        houseData.photo.forEach((file, index) => {
            formData.append(`photo${index}`, file);
        })

        try {
            const response = await fetch('/api/admin/houses/add', {
                method: 'POST',
                headers: {
                },
                body: formData,
            });
            if (response.ok) {
                setLoading(false);
                const data = await response.json();
                setDialogOpen(true, 'success', data.description);
                handleResetForm();
                refresh();
            } else {
                const error = await response.json();
                window?.scrollTo({ top: 0, behavior: 'smooth' });
                setDialogOpen(true, 'error', error.message);
                setLoading(false);
                return
            };
        }
        catch (error) {
            window?.scrollTo({ top: 0, behavior: 'smooth' });
            setDialogOpen(true, 'error', 'Щось пішло не так, як планувалось! Спробуйте ще раз!');
            setLoading(false);
            return
        }
    }

    return (
        <Box
            component="form"
            ref={formRef}
            sx={{
                display: 'flex',
                maxWidth: '80%',
                mx: 'auto',
                flexDirection: 'column',
                gap: 5,
                '& .MuiTextField-root': { m: 1, ml: 0, }
            }}
            autoComplete="off"
            onSubmit={handleSubmit}
        >

            <HouseFieldset
                legend={'Назва шляху в адресному рядку (формат запису через дефіс: hatynka-dida-moroza)'}
                nameAttr="name"
            />

            <FileUploadWithPreview label={'Фото для галереї на сторінці будинку'} nameAttr={"photo"} multiple />

            {
                fieldsetData.map(({ legend, nameAttr, multiLang, multiline }, index) => (
                    <HouseFieldset
                        key={index}
                        legend={legend}
                        nameAttr={nameAttr}
                        multiLang={multiLang}
                        multiline={multiline || false}
                    />
                ))
            }

            <NumberFields />

            <HouseSelect housesList={housesList} />

            <SubmitFabGroup
                loading={loading}
                onReset={handleResetForm}
                onSubmit={() => { }}
            />
        </Box>
    )
}