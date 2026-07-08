package com.example.BankingSystem.api;

import com.example.BankingSystem.exception.ResourceNotFoundException;
import com.example.BankingSystem.model.LanguageLesson;
import com.example.BankingSystem.repository.LanguageLessonRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class LanguageLessonController {

    private final LanguageLessonRepository lessonRepository;

    public LanguageLessonController(LanguageLessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @GetMapping
    public List<LanguageLesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LanguageLesson createLesson(@RequestBody CreateLessonRequest request) {
        LanguageLesson lesson = new LanguageLesson();
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setQuestion(request.question());
        lesson.setOptions(request.options());
        lesson.setCorrectAnswer(request.correctAnswer());
        lesson.setPointsReward(request.pointsReward());
        return lessonRepository.save(lesson);
    }

    @PutMapping("/{id}")
    public LanguageLesson updateLesson(@PathVariable Long id, @RequestBody CreateLessonRequest request) {
        LanguageLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học có ID: " + id));
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setQuestion(request.question());
        lesson.setOptions(request.options());
        lesson.setCorrectAnswer(request.correctAnswer());
        lesson.setPointsReward(request.pointsReward());
        return lessonRepository.save(lesson);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLesson(@PathVariable Long id) {
        LanguageLesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài học có ID: " + id));
        lessonRepository.delete(lesson);
    }

    public record CreateLessonRequest(
        String title,
        String content,
        String question,
        String options, // comma-separated options
        String correctAnswer,
        Integer pointsReward
    ) {}
}
