package kr.momo.controller.meeting;

import jakarta.validation.Valid;
import java.net.URI;
import kr.momo.controller.MomoApiResponse;
import kr.momo.controller.auth.AuthAttendee;
import kr.momo.service.meeting.MeetingService;
import kr.momo.service.meeting.dto.MeetingCreateRequest;
import kr.momo.service.meeting.dto.MeetingResponse;
import kr.momo.service.meeting.dto.MeetingSharingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping("/api/v1/meetings")
    public ResponseEntity<MomoApiResponse<MeetingSharingResponse>> create(
            @RequestBody @Valid MeetingCreateRequest request
    ) {
        MeetingSharingResponse response = meetingService.create(request);
        return ResponseEntity.created(URI.create("/meeting/" + response.uuid()))
                .body(new MomoApiResponse<>(response));
    }

    @GetMapping("/api/v1/meetings/{uuid}")
    public MomoApiResponse<MeetingResponse> find(@PathVariable String uuid) {
        MeetingResponse meetingResponse = meetingService.findByUUID(uuid);
        return new MomoApiResponse<>(meetingResponse);
    }

    @GetMapping("/api/v1/meetings/{uuid}/sharing")
    public MomoApiResponse<MeetingSharingResponse> findMeetingSharing(@PathVariable String uuid) {
        MeetingSharingResponse response = meetingService.findMeetingSharing(uuid);
        return new MomoApiResponse<>(response);
    }

    @PatchMapping("/api/v1/meetings/{uuid}/lock")
    public void lock(@PathVariable String uuid, @AuthAttendee long id) {
        meetingService.lock(uuid, id);
    }
}
