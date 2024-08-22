import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { MeetingDateTime } from 'types/meeting';
import type { MeetingSingleSchedule } from 'types/schedule';

import { TimePickerUpdateStateContext } from '@contexts/TimePickerUpdateStateProvider';

import ScheduleTimeList from '@components/Schedules/ScheduleTableFrame/ScheduleTimeList';
import { Button } from '@components/_common/Buttons/Button';
import TabButton from '@components/_common/Buttons/TabButton';
import Text from '@components/_common/Text';

import usePagedTimePick from '@hooks/usePagedTimePick/usePagedTimePick';

import { usePostScheduleMutation } from '@stores/servers/schedule/mutations';

import Rotate from '@assets/images/rotate.svg';

import DateControlButtons from '../DateControlButtons';
import ScheduleDateDayList from '../ScheduleTableFrame/ScheduleDateDayList';
import {
  s_baseTimeCell,
  s_bottomFixedButtonContainer,
  s_cellColorBySelected,
  s_circleButton,
  s_fullButtonContainer,
  s_relativeContainer,
  s_scheduleTable,
  s_scheduleTableBody,
  s_scheduleTableContainer,
  s_scheduleTableRow,
  s_selectModeButtonsContainer,
} from '../Schedules.styles';
import { convertToSchedule, generateSingleScheduleTable } from '../Schedules.util';

interface SchedulePickerProps extends MeetingDateTime {
  meetingSingleSchedule: MeetingSingleSchedule;
}

const TIME_SELECT_MODE = {
  available: '되는',
  unavailable: '안되는',
} as const;

export default function SchedulePicker({
  firstTime,
  lastTime,
  availableDates,
  meetingSingleSchedule,
}: SchedulePickerProps) {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid!;

  const { handleToggleIsTimePickerUpdate } = useContext(TimePickerUpdateStateContext);

  const schedules = generateSingleScheduleTable({
    firstTime,
    lastTime,
    availableDates,
    meetingSingleSchedule,
  });

  const {
    tableRef,
    tableValue,
    currentTableValue,
    resetTableValue,
    currentDates,
    isMultiPage,
    increaseDatePage,
    decreaseDatePage,
    isFirstPage,
    isLastPage,
  } = usePagedTimePick(availableDates, schedules);

  const { mutate: postScheduleMutate, isPending } = usePostScheduleMutation(() =>
    handleToggleIsTimePickerUpdate(),
  );

  const handleOnToggle = () => {
    const convert = convertToSchedule({
      availableDates,
      firstTime,
      lastTime,
      selectedScheduleTable: tableValue,
      selectMode,
    });

    postScheduleMutate({ uuid, requestData: convert });
  };

  const [selectMode, setSelectMode] = useState<keyof typeof TIME_SELECT_MODE>('available');
  const handleSelectModeChange = (mode: keyof typeof TIME_SELECT_MODE) => {
    if (selectMode === mode) return;

    resetTableValue();
    setSelectMode(mode);
  };

  return (
    <>
      <div css={s_relativeContainer}>
        <div css={s_selectModeButtonsContainer}>
          <TabButton
            isActive={selectMode === 'available'}
            onClick={() => handleSelectModeChange('available')}
          >
            {TIME_SELECT_MODE.available}
          </TabButton>
          <p>/</p>
          <TabButton
            isActive={selectMode === 'unavailable'}
            onClick={() => handleSelectModeChange('unavailable')}
          >
            {TIME_SELECT_MODE.unavailable}
          </TabButton>
          <Text typo="bodyBold">시간으로 선택하기</Text>
        </div>
        {isMultiPage && (
          <DateControlButtons
            decreaseDatePage={decreaseDatePage}
            increaseDatePage={increaseDatePage}
            isFirstPage={isFirstPage}
            isLastPage={isLastPage}
          />
        )}
        <section css={s_scheduleTableContainer}>
          <ScheduleTimeList firstTime={firstTime} lastTime={lastTime} />
          <table css={s_scheduleTable} ref={tableRef} aria-label="약속 시간 수정 테이블">
            <thead>
              <ScheduleDateDayList availableDates={currentDates} />
            </thead>
            <tbody css={s_scheduleTableBody}>
              {currentTableValue.map((row, rowIndex) => (
                <tr key={rowIndex} css={s_scheduleTableRow}>
                  {row.map((isSelected, columnIndex) => {
                    const isHalfHour = rowIndex % 2 !== 0;
                    const isLastRow = rowIndex === schedules.length - 1;

                    return (
                      <td
                        key={columnIndex}
                        css={[
                          s_baseTimeCell(isHalfHour, isLastRow),
                          s_cellColorBySelected(isSelected, selectMode === 'unavailable'),
                        ]}
                      ></td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <footer css={s_bottomFixedButtonContainer}>
        <div css={s_fullButtonContainer}>
          <Button size="full" variant="primary" onClick={handleOnToggle} isLoading={isPending}>
            등록하기
          </Button>
        </div>
        <button css={s_circleButton} onClick={resetTableValue}>
          <Rotate width="16" height="16" />
          <Text typo="captionMedium">
            <Text.Accent text="초기화" />
          </Text>
        </button>
      </footer>
    </>
  );
}
